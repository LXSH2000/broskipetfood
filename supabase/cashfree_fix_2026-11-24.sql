-- BROSKI – Cashfree safety fix (24 Nov 2026)
-- 1) Secret key is read from the admin-only secrets table (never typed into code or git).
-- 2) No fake fallback phone. 3) Retry of the same order reuses the Cashfree order (no 409 error).
-- 4) Order is marked "online/upi" only after Cashfree says PAID, and the paid amount must match.
-- 5) online_attempt_at = customer opened online payment (admin can call before delivering if still unpaid).
-- Supabase → SQL Editor → paste all → Run. Safe to run twice.
-- AFTER running, add your secret key yourself in a SEPARATE query (never in chat, never in git):
--   insert into public.secrets (k, v) values ('cashfree_secret', 'PASTE_SECRET_HERE')
--   on conflict (k) do update set v = excluded.v;

alter table public.orders add column if not exists online_attempt_at timestamptz;

create or replace function public.create_cashfree_session(p_public_no text, p_token text)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_order record;
  v_cust record;
  v_phone text;
  v_body text;
  v_res extensions.http_response;
  v_cf jsonb;
  v_app_id text := '1542128bb6bb9cb1eb8767ccad48212451';
  v_secret text;
begin
  select v into v_secret from public.secrets where k = 'cashfree_secret';
  if coalesce(v_secret,'') = '' then
    return json_build_object('status','error','message','Online payment is not available right now. Please choose Cash / UPI on delivery.');
  end if;

  select * into v_order from public.orders
  where public_no = trim(p_public_no) and token = trim(p_token);
  if v_order.id is null then
    return json_build_object('status','error','message','Order not found or invalid token.');
  end if;
  if v_order.payment_status = 'paid' then
    return json_build_object('status','error','message','This order is already paid.');
  end if;
  if v_order.status = 'cancelled' then
    return json_build_object('status','error','message','This order was cancelled.');
  end if;

  select * into v_cust from public.customers where id = v_order.customer_id;
  v_phone := right(regexp_replace(coalesce(v_cust.phone,''), '\D', '', 'g'), 10);
  if length(v_phone) <> 10 then
    return json_build_object('status','error','message','Phone number missing on this order. Please choose Cash / UPI on delivery.');
  end if;

  v_body := json_build_object(
    'order_id', v_order.public_no,
    'order_amount', v_order.total::numeric,
    'order_currency', 'INR',
    'customer_details', json_build_object(
      'customer_id', 'cust_' || v_phone,
      'customer_phone', v_phone,
      'customer_name', coalesce(nullif(trim(v_cust.name),''), 'Pet Parent')),
    'order_meta', json_build_object(
      'return_url', 'https://broskipetfood.com/order/?no=' || v_order.public_no || '&t=' || v_order.token)
  )::text;

  select * into v_res from extensions.http((
    'POST', 'https://api.cashfree.com/pg/orders',
    array[extensions.http_header('x-client-id', v_app_id),
          extensions.http_header('x-client-secret', v_secret),
          extensions.http_header('x-api-version', '2023-08-01')],
    'application/json', v_body)::extensions.http_request);

  -- Same order tried again (customer closed the payment window): reuse it
  if v_res.status = 409 then
    select * into v_res from extensions.http((
      'GET', 'https://api.cashfree.com/pg/orders/' || v_order.public_no,
      array[extensions.http_header('x-client-id', v_app_id),
            extensions.http_header('x-client-secret', v_secret),
            extensions.http_header('x-api-version', '2023-08-01')],
      null, null)::extensions.http_request);
  end if;

  if v_res.status not in (200, 201) then
    return json_build_object('status','error','message','Could not start online payment. Please try again or choose Cash / UPI on delivery.');
  end if;

  v_cf := v_res.content::jsonb;
  if v_cf->>'order_status' = 'PAID' then
    return json_build_object('status','error','message','This order is already paid.');
  end if;
  update public.orders set online_attempt_at = coalesce(online_attempt_at, now()) where id = v_order.id;
  if coalesce(v_cf->>'payment_session_id','') = '' then
    return json_build_object('status','error','message','Could not start online payment. Please choose Cash / UPI on delivery.');
  end if;

  return json_build_object('status','ok',
    'payment_session_id', v_cf->>'payment_session_id',
    'order_id', v_order.public_no,
    'total', v_order.total);
end $$;

create or replace function public.verify_cashfree_payment(p_public_no text, p_token text)
returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_order record;
  v_res extensions.http_response;
  v_cf jsonb;
  v_app_id text := '1542128bb6bb9cb1eb8767ccad48212451';
  v_secret text;
begin
  select * into v_order from public.orders
  where public_no = trim(p_public_no) and token = trim(p_token);
  if v_order.id is null then
    return json_build_object('status','error','message','Order not found.');
  end if;
  if v_order.payment_status = 'paid' then
    return json_build_object('status','ok','payment_status','paid');
  end if;

  select v into v_secret from public.secrets where k = 'cashfree_secret';
  if coalesce(v_secret,'') = '' then
    return json_build_object('status','pending','payment_status',v_order.payment_status);
  end if;

  select * into v_res from extensions.http((
    'GET', 'https://api.cashfree.com/pg/orders/' || v_order.public_no,
    array[extensions.http_header('x-client-id', v_app_id),
          extensions.http_header('x-client-secret', v_secret),
          extensions.http_header('x-api-version', '2023-08-01')],
    null, null)::extensions.http_request);

  if v_res.status = 404 then
    return json_build_object('status','pending','payment_status',v_order.payment_status);
  end if;
  if v_res.status <> 200 then
    return json_build_object('status','error','message','Could not verify payment.');
  end if;

  v_cf := v_res.content::jsonb;
  if v_cf->>'order_status' = 'PAID'
     and (v_cf->>'order_amount')::numeric = v_order.total::numeric then
    update public.orders
       set payment_status = 'paid', paid_at = now(), payment_method = 'upi',
           status = case when status = 'placed' then 'confirmed' else status end
     where id = v_order.id;
    return json_build_object('status','ok','payment_status','paid');
  end if;

  return json_build_object('status','pending','payment_status',v_order.payment_status,
                           'cf_status', v_cf->>'order_status');
end $$;

revoke all on function public.create_cashfree_session(text,text) from public;
revoke all on function public.verify_cashfree_payment(text,text) from public;
grant execute on function public.create_cashfree_session(text,text) to anon, authenticated;
grant execute on function public.verify_cashfree_payment(text,text) to anon, authenticated;

-- Check: shows 1 if your secret is saved (does not show the secret)
select count(*) as cashfree_secret_saved from public.secrets where k = 'cashfree_secret' and v <> '';
