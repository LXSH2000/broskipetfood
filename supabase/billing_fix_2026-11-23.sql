-- BROSKI – Billing fix (23 Nov 2026). Supabase → SQL Editor → paste all → Run. Safe to run twice.

-- A) Make sure YOU are an admin (bills are refused if you are not in the admins table).
--    Replace YOUR_ADMIN_EMAIL with the email you use to log in to broskipetfood.com/admin.
insert into public.admins (user_id)
select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
on conflict do nothing;
-- Check: this must return 1 row with your email.
select u.email from public.admins a join auth.users u on u.id = a.user_id;

-- B) Offline sales must NOT be attached to a random online customer.
--    (Old code linked every offline sale to "the first customer" – that customer would see the
--    shop's purchases in /points and get wrong totals.)
alter table public.orders alter column customer_id drop not null;
update public.orders set customer_id = null where channel in ('offline','shop');

create or replace function public.admin_create_document(
  p_doc_type text, p_party_id uuid, p_items jsonb, p_subtotal int, p_discount int, p_total int,
  p_payment_method text, p_payment_status text, p_due_date date, p_notes text,
  p_party_data jsonb default null
) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_fy text := public.current_fy();
  v_doc_no text;
  v_party_id uuid := p_party_id;
  v_doc record;
  v_order record;
  v_item jsonb;
  v_sub int := 0;
  v_disc int := 0;
  v_items jsonb := '[]'::jsonb;
begin
  if not public.is_admin() then return json_build_object('error','unauthorized'); end if;
  if p_doc_type not in ('quotation','estimate','bill','challan') then
    return json_build_object('error','invalid_doc_type');
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    return json_build_object('error','no_items');
  end if;

  -- Recalculate amounts on the server (rate × qty − discount); free qty is not charged
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'id', coalesce(v_item->>'id','custom'),
      'name', coalesce(v_item->>'name','Item'),
      'hsn', coalesce(v_item->>'hsn','2309'),
      'qty', greatest(coalesce((v_item->>'qty')::int,0),0),
      'free_qty', greatest(coalesce((v_item->>'free_qty')::int,0),0),
      'rate', greatest(coalesce((v_item->>'rate')::numeric,0),0),
      'discount', greatest(coalesce((v_item->>'discount')::numeric,0),0),
      'amount', greatest(coalesce((v_item->>'rate')::numeric,0) * greatest(coalesce((v_item->>'qty')::int,0),0)
                         - coalesce((v_item->>'discount')::numeric,0), 0)
    ));
    v_sub := v_sub + (coalesce((v_item->>'rate')::numeric,0) * greatest(coalesce((v_item->>'qty')::int,0),0))::int;
    v_disc := v_disc + coalesce((v_item->>'discount')::numeric,0)::int;
  end loop;

  if v_party_id is null and p_party_data is not null and coalesce(trim(p_party_data->>'name'),'') <> '' then
    insert into public.parties (kind, name, phone, area, address, gstin)
    values (case when p_party_data->>'kind' in ('walkin','shop') then p_party_data->>'kind' else 'walkin' end,
            trim(p_party_data->>'name'), p_party_data->>'phone', p_party_data->>'area',
            p_party_data->>'address', nullif(upper(trim(coalesce(p_party_data->>'gstin',''))),''))
    returning id into v_party_id;
  end if;

  v_doc_no := public.next_doc_no(p_doc_type);

  insert into public.documents (doc_type, doc_no, fy, doc_date, party_id, items,
    subtotal, discount, total, payment_method, payment_status, due_date, notes, meta)
  values (p_doc_type, v_doc_no, v_fy, current_date, v_party_id, v_items,
    v_sub, v_disc, greatest(v_sub - v_disc, 0),
    case when p_payment_method in ('cash','upi','credit','cod') then p_payment_method else 'cash' end,
    case when p_payment_status in ('paid','unpaid') then p_payment_status else 'unpaid' end,
    p_due_date, nullif(trim(coalesce(p_notes,'')),''), coalesce(p_party_data,'{}'::jsonb))
  returning * into v_doc;

  -- Estimates and bills are sales → one record in orders (no customer link)
  if p_doc_type in ('estimate','bill') then
    insert into public.orders (items, subtotal, delivery_fee, total, channel, status,
      payment_method, payment_status, public_no, token, bill_no, bill_date, customer_id)
    values (v_items, v_sub, 0, greatest(v_sub - v_disc, 0),
      case when coalesce(p_party_data->>'kind','walkin') = 'shop' then 'shop' else 'offline' end,
      'delivered', v_doc.payment_method, v_doc.payment_status,
      'OFF-' || v_doc_no, v_doc.token,
      case when p_doc_type = 'bill' then v_doc_no else null end,
      case when p_doc_type = 'bill' then current_date else null end, null)
    returning * into v_order;
    update public.documents set order_id = v_order.id where id = v_doc.id;
  end if;

  return json_build_object('status','ok','id',v_doc.id,'doc_no',v_doc_no,'token',v_doc.token);
end $$;

revoke all on function public.admin_create_document(text,uuid,jsonb,int,int,int,text,text,date,text,jsonb) from public;
grant execute on function public.admin_create_document(text,uuid,jsonb,int,int,int,text,text,date,text,jsonb) to authenticated;

-- C) Points/order history must ignore offline sales (they have no customer now) – nothing else to change.
