-- ============================================================================
-- CASHFREE PG INTEGRATION FOR BROSKI
-- 23 Nov 2026
-- Enables instant online payments (UPI, PhonePe, GPay, Cards, Netbanking)
-- ============================================================================

-- 1. Ensure HTTP extension is enabled in extensions schema
create extension if not exists http with schema extensions;

-- 2. Create Cashfree Payment Session for a Placed Order
create or replace function public.create_cashfree_session(
  p_public_no text,
  p_token text
) returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order record;
  v_cust record;
  v_body text;
  v_response extensions.http_response;
  v_clean_phone text;
  v_cf_data jsonb;
  v_app_id text := '1542128bb6bb9cb1eb8767ccad48212451';
  v_secret text := 'YOUR_CASHFREE_SECRET_KEY'; -- Configured in Supabase SQL Editor
begin
  -- 1. Find and verify order
  select * into v_order
  from public.orders
  where public_no = trim(p_public_no) and token = trim(p_token);

  if v_order.id is null then
    return json_build_object('status', 'error', 'message', 'Order not found or invalid token.');
  end if;

  -- 2. Get customer details
  select * into v_cust
  from public.customers
  where id = v_order.customer_id;

  v_clean_phone := right(regexp_replace(coalesce(v_cust.phone, '9821563468'), '\D', '', 'g'), 10);

  -- 3. Prepare Cashfree JSON body
  v_body := json_build_object(
    'order_id', v_order.public_no,
    'order_amount', v_order.total::numeric,
    'order_currency', 'INR',
    'customer_details', json_build_object(
      'customer_id', 'cust_' || v_clean_phone,
      'customer_phone', v_clean_phone,
      'customer_name', coalesce(nullif(trim(v_cust.name), ''), 'Pet Parent')
    ),
    'order_meta', json_build_object(
      'return_url', 'https://broskipetfood.com/order/?no=' || v_order.public_no || '&t=' || v_order.token
    )
  )::text;

  -- 4. Send HTTP POST request to Cashfree Production API
  select * into v_response
  from extensions.http((
    'POST',
    'https://api.cashfree.com/pg/orders',
    ARRAY[
      extensions.http_header('x-client-id', v_app_id),
      extensions.http_header('x-client-secret', v_secret),
      extensions.http_header('x-api-version', '2023-08-01')
    ],
    'application/json',
    v_body
  )::extensions.http_request);

  if v_response.status != 200 then
    return json_build_object(
      'status', 'error',
      'http_status', v_response.status,
      'message', 'Cashfree order creation failed: ' || coalesce(v_response.content, '')
    );
  end if;

  v_cf_data := v_response.content::jsonb;

  -- 5. Update order payment method
  update public.orders
  set payment_method = 'upi'
  where id = v_order.id;

  return json_build_object(
    'status', 'ok',
    'payment_session_id', v_cf_data->>'payment_session_id',
    'cf_order_id', v_cf_data->>'cf_order_id',
    'order_id', v_order.public_no,
    'total', v_order.total
  );
end;
$$;

-- 3. Verify Cashfree Payment Status
create or replace function public.verify_cashfree_payment(
  p_public_no text,
  p_token text
) returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order record;
  v_response extensions.http_response;
  v_cf_data jsonb;
  v_status text;
  v_app_id text := '1542128bb6bb9cb1eb8767ccad48212451';
  v_secret text := 'YOUR_CASHFREE_SECRET_KEY'; -- Configured in Supabase SQL Editor
begin
  select * into v_order
  from public.orders
  where public_no = trim(p_public_no) and token = trim(p_token);

  if v_order.id is null then
    return json_build_object('status', 'error', 'message', 'Order not found.');
  end if;

  -- If already paid, return ok
  if v_order.payment_status = 'paid' then
    return json_build_object('status', 'ok', 'payment_status', 'paid');
  end if;

  -- Query Cashfree for order status
  select * into v_response
  from extensions.http((
    'GET',
    'https://api.cashfree.com/pg/orders/' || v_order.public_no,
    ARRAY[
      extensions.http_header('x-client-id', v_app_id),
      extensions.http_header('x-client-secret', v_secret),
      extensions.http_header('x-api-version', '2023-08-01')
    ],
    null,
    null
  )::extensions.http_request);

  if v_response.status != 200 then
    return json_build_object('status', 'error', 'message', 'Could not verify payment with Cashfree.');
  end if;

  v_cf_data := v_response.content::jsonb;
  v_status := v_cf_data->>'order_status';

  if v_status = 'PAID' then
    update public.orders
    set payment_status = 'paid',
        paid_at = now(),
        payment_method = 'upi',
        status = case when status = 'placed' then 'confirmed' else status end
    where id = v_order.id;

    return json_build_object('status', 'ok', 'payment_status', 'paid', 'cf_status', v_status);
  end if;

  return json_build_object('status', 'pending', 'payment_status', v_order.payment_status, 'cf_status', v_status);
end;
$$;

-- 4. Grant execute permissions to frontend users
revoke all on function public.create_cashfree_session from public;
revoke all on function public.verify_cashfree_payment from public;

grant execute on function public.create_cashfree_session to anon, authenticated;
grant execute on function public.verify_cashfree_payment to anon, authenticated;
