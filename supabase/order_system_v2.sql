-- ==============================================================================
-- BROSKI Order System V2 + Admin Billing Migration
-- Safe to run multiple times (idempotent)
-- Target: Supabase Postgres
-- ==============================================================================

-- 1. Settings Table
create table if not exists public.settings (
  k text primary key,
  v jsonb not null
);

-- Seed Settings
insert into public.settings (k, v) values
  ('prices', '{"bites": 149, "mix": 179, "combo": 295}'::jsonb),
  ('zones', '{"A": {"name": "Nangloi Express", "pins": ["110041"], "fee": 0, "free_min": 295, "eta": "Today or tomorrow"}, "B": {"name": "Porter Express", "pins": ["110087","110063","110081","110086","110043","110059","110056","110058","110027","110015","110026","110034"], "eta": "Same day by Porter", "note": "Porter fare paid at delivery"}}'::jsonb),
  ('slots', '["11 am – 2 pm", "4 pm – 8 pm"]'::jsonb),
  ('unlock_target', '25'::jsonb),
  ('upi', '{"vpa": "", "name": "BROSKI"}'::jsonb),
  ('business', '{"name": "BROSKI", "gstin": "", "bill_address": "", "state": "Delhi (07)", "hsn": "2309"}'::jsonb),
  ('points', '{"per_rupees": 10}'::jsonb)
on conflict (k) do nothing;

-- 2. Waitlist Table
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  name text,
  pincode text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_phone_pincode_key unique (phone, pincode)
);

-- 3. Parties Table (for offline billing)
create table if not exists public.parties (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('walkin','shop')),
  name text not null,
  phone text,
  area text,
  address text,
  gstin text,
  created_at timestamptz not null default now()
);

-- 4. Document Counters Table
create table if not exists public.doc_counters (
  doc_type text not null,
  fy text not null,
  n int not null default 0,
  primary key (doc_type, fy)
);

-- 5. Order Daily Counters Table
create table if not exists public.order_counters (
  day_str text primary key,
  n int not null default 0
);

-- 6. Secrets Table (for optional alerts)
create table if not exists public.secrets (
  k text primary key,
  v text not null
);

-- 7. Update Orders Table Structure
alter table public.orders add column if not exists public_no text unique;
alter table public.orders add column if not exists token text;
alter table public.orders add column if not exists pincode text;
alter table public.orders add column if not exists zone text default 'A';
alter table public.orders add column if not exists address text;
alter table public.orders add column if not exists landmark text;
alter table public.orders add column if not exists slot text;
alter table public.orders add column if not exists delivery_mode text default 'own';
alter table public.orders add column if not exists subtotal int;
alter table public.orders add column if not exists delivery_fee int default 0;
alter table public.orders add column if not exists payment_method text default 'cod';
alter table public.orders add column if not exists payment_status text default 'unpaid';
alter table public.orders add column if not exists utr text;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists bill_no text unique;
alter table public.orders add column if not exists bill_date date;
alter table public.orders add column if not exists bill_requested boolean default false;
alter table public.orders add column if not exists sample_claim_id uuid;
alter table public.orders add column if not exists cancel_reason text;
alter table public.orders add column if not exists updated_at timestamptz default now();

-- Update check constraints on orders
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('requested','placed','confirmed','out_for_delivery','delivered','cancelled'));

alter table public.orders drop constraint if exists orders_channel_check;
alter table public.orders add constraint orders_channel_check
  check (channel in ('site','whatsapp','shop','offline'));

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('cod','upi','cash','credit'));

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('unpaid','paid','refunded'));

-- 8. Update Sample Claims Table Structure
-- Migrate old statuses
update public.sample_claims set status = 'reserved' where status in ('pending','verified');
update public.sample_claims set status = 'given' where status = 'handed';

alter table public.sample_claims drop constraint if exists sample_claims_status_check;
alter table public.sample_claims add constraint sample_claims_status_check
  check (status in ('reserved','added','given','expired','rejected'));

alter table public.sample_claims add column if not exists mode text default 'with_order';
alter table public.sample_claims drop constraint if exists sample_claims_mode_check;
alter table public.sample_claims add constraint sample_claims_mode_check
  check (mode in ('with_order','route_drop','shop'));

alter table public.sample_claims add column if not exists order_id uuid references public.orders(id) on delete set null;
alter table public.sample_claims add column if not exists address_key text;
alter table public.sample_claims add column if not exists given_at timestamptz;

-- 9. Documents Table (Online + Offline Billing)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  doc_type text not null check (doc_type in ('quotation','estimate','bill','challan','daily')),
  doc_no text unique not null,
  fy text not null,
  doc_date date not null default current_date,
  party_id uuid references public.parties(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  subtotal int not null default 0,
  discount int not null default 0,
  total int not null default 0,
  payment_method text check (payment_method in ('cash','upi','credit','cod')),
  payment_status text not null default 'unpaid' check (payment_status in ('paid','unpaid')),
  due_date date,
  notes text,
  status text not null default 'active' check (status in ('active','cancelled')),
  cancel_reason text,
  converted_from uuid references public.documents(id) on delete set null,
  token text not null default encode(gen_random_bytes(12), 'hex'),
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists orders_public_no_idx on public.orders(public_no);
create index if not exists orders_status_created_idx on public.orders(status, created_at desc);
create index if not exists documents_doc_no_idx on public.documents(doc_no);
create index if not exists documents_order_id_idx on public.documents(order_id);
create index if not exists sample_claims_address_key_idx on public.sample_claims(address_key);

-- 10. Enable RLS on all tables
alter table public.settings enable row level security;
alter table public.waitlist enable row level security;
alter table public.parties enable row level security;
alter table public.documents enable row level security;
alter table public.doc_counters enable row level security;
alter table public.order_counters enable row level security;
alter table public.secrets enable row level security;

-- Drop existing admin policies if present
drop policy if exists admin_all on public.settings;
drop policy if exists admin_all on public.waitlist;
drop policy if exists admin_all on public.parties;
drop policy if exists admin_all on public.documents;
drop policy if exists admin_all on public.doc_counters;
drop policy if exists admin_all on public.order_counters;
drop policy if exists admin_all on public.secrets;

create policy admin_all on public.settings      for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.waitlist      for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.parties       for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.documents     for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.doc_counters  for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.order_counters for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.secrets       for all using (public.is_admin()) with check (public.is_admin());

-- 11. Helper Functions
create or replace function public.current_fy() returns text
language plpgsql stable as $$
declare
  v_now timestamptz := now() at time zone 'Asia/Kolkata';
  v_year int := extract(year from v_now)::int;
  v_month int := extract(month from v_now)::int;
  v_y1 text;
  v_y2 text;
begin
  if v_month >= 4 then
    v_y1 := to_char(v_year, 'FM0000');
    v_y2 := to_char(v_year + 1, 'FM0000');
  else
    v_y1 := to_char(v_year - 1, 'FM0000');
    v_y2 := to_char(v_year, 'FM0000');
  end if;
  return right(v_y1, 2) || '-' || right(v_y2, 2);
end $$;

create or replace function public.clean_address_key(p_addr text, p_pin text) returns text
language sql immutable as $$
  select lower(regexp_replace(coalesce(p_addr,'') || coalesce(p_pin,''), '[^a-zA-Z0-9]', '', 'g'))
$$;

create or replace function public.next_doc_no(p_doc_type text) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_fy text := public.current_fy();
  v_n int;
begin
  insert into public.doc_counters (doc_type, fy, n)
  values (p_doc_type, v_fy, 1)
  on conflict (doc_type, fy) do update
  set n = public.doc_counters.n + 1
  returning n into v_n;

  case p_doc_type
    when 'quotation' then
      return 'QT/' || v_fy || '/' || lpad(v_n::text, 4, '0');
    when 'estimate' then
      return 'EST/' || v_fy || '/' || lpad(v_n::text, 4, '0');
    when 'bill' then
      return 'BRK/' || v_fy || '/' || lpad(v_n::text, 4, '0');
    when 'challan' then
      return 'DC/' || v_fy || '/' || lpad(v_n::text, 4, '0');
    when 'daily' then
      return 'BRK/' || v_fy || '/D-' || lpad(v_n::text, 4, '0');
    else
      raise exception 'Invalid doc_type: %', p_doc_type;
  end case;
end $$;

create or replace function public.next_order_public_no() returns text
language plpgsql security definer set search_path = public as $$
declare
  v_day text := to_char(now() at time zone 'Asia/Kolkata', 'DDMM');
  v_n int;
begin
  insert into public.order_counters (day_str, n)
  values (v_day, 1)
  on conflict (day_str) do update
  set n = public.order_counters.n + 1
  returning n into v_n;

  return 'BRK-' || v_day || '-' || lpad(v_n::text, 3, '0');
end $$;

-- Auto-expire reserved sample claims older than 60 days
create or replace function public.expire_old_sample_claims() returns int
language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  update public.sample_claims
  set status = 'expired'
  where status = 'reserved'
    and created_at < now() - interval '60 days';
  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- Issue GST Bill for Order
create or replace function public.issue_bill_for_order(p_order_id uuid) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_order record;
  v_cust record;
  v_doc_no text;
  v_fy text := public.current_fy();
  v_doc record;
  v_items jsonb := '[]'::jsonb;
  v_item jsonb;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then
    return json_build_object('status', 'not_found');
  end if;

  -- Check if active bill already exists for this order
  select * into v_doc from public.documents where order_id = p_order_id and doc_type = 'bill' and status = 'active';
  if found then
    -- Already issued
    update public.orders set bill_no = v_doc.doc_no, bill_date = v_doc.doc_date where id = p_order_id;
    return json_build_object('status', 'exists', 'doc_no', v_doc.doc_no);
  end if;

  select * into v_cust from public.customers where id = v_order.customer_id;

  v_doc_no := public.next_doc_no('bill');

  -- Format items with HSN 2309
  for v_item in select * from jsonb_array_elements(v_order.items)
  loop
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'id', v_item->>'id',
      'name', v_item->>'name',
      'hsn', '2309',
      'qty', coalesce((v_item->>'qty')::int, 1),
      'rate', coalesce((v_item->>'price')::int, 0),
      'discount', 0,
      'amount', coalesce((v_item->>'amount')::int, (v_item->>'price')::int * (v_item->>'qty')::int, 0)
    ));
  end loop;

  insert into public.documents (
    doc_type, doc_no, fy, doc_date, order_id, items,
    subtotal, discount, total, payment_method, payment_status,
    meta
  ) values (
    'bill', v_doc_no, v_fy, current_date, v_order.id, v_items,
    v_order.subtotal, 0, v_order.total, v_order.payment_method,
    case when v_order.payment_status = 'paid' then 'paid' else 'unpaid' end,
    jsonb_build_object(
      'customer_name', v_cust.name,
      'customer_phone', v_cust.phone,
      'address', v_order.address,
      'pincode', v_order.pincode,
      'public_no', v_order.public_no
    )
  ) returning * into v_doc;

  update public.orders
  set bill_no = v_doc_no, bill_date = current_date
  where id = p_order_id;

  return json_build_object('status', 'ok', 'doc_no', v_doc_no, 'id', v_doc.id);
end $$;

-- Order status transitions & triggers handler
create or replace function public.on_order_status_update() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_pts_setting jsonb;
  v_per_rs int := 10;
  v_points int;
begin
  NEW.updated_at := now();

  -- When status changes to delivered
  if NEW.status = 'delivered' and (OLD.status is null or OLD.status <> 'delivered') then
    -- 1. Auto-award points (1 per Rs 10 of total)
    select v into v_pts_setting from public.settings where k = 'points';
    if v_pts_setting ? 'per_rupees' then
      v_per_rs := (v_pts_setting->>'per_rupees')::int;
      if v_per_rs <= 0 then v_per_rs := 10; end if;
    end if;

    v_points := floor(NEW.total / v_per_rs);
    if v_points > 0 then
      insert into public.points_ledger (customer_id, delta, reason, ref)
      values (NEW.customer_id, v_points, 'Delivered order ' || coalesce(NEW.public_no, ''), NEW.id);
    end if;

    -- 2. Mark linked sample claim as given
    if NEW.sample_claim_id is not null then
      update public.sample_claims
      set status = 'given', given_at = now()
      where id = NEW.sample_claim_id and status = 'added';
    end if;

    -- 3. Auto-issue bill if total >= 200
    if NEW.total >= 200 and NEW.bill_no is null then
      perform public.issue_bill_for_order(NEW.id);
    end if;
  end if;

  -- When order is paid and total >= 200, auto-issue bill
  if NEW.payment_status = 'paid' and (OLD.payment_status is null or OLD.payment_status <> 'paid') then
    if NEW.paid_at is null then
      NEW.paid_at := now();
    end if;
    if NEW.total >= 200 and NEW.bill_no is null then
      perform public.issue_bill_for_order(NEW.id);
    end if;
  end if;

  return NEW;
end $$;

drop trigger if exists trg_order_status_update on public.orders;
create trigger trg_order_status_update
  before update on public.orders
  for each row execute function public.on_order_status_update();

-- 12. Public RPC: get_shop_settings()
create or replace function public.get_shop_settings() returns json
language plpgsql security definer set search_path = public as $$
declare
  v_prices jsonb;
  v_zones jsonb;
  v_slots jsonb;
  v_target jsonb;
  v_upi jsonb;
begin
  select v into v_prices from public.settings where k = 'prices';
  select v into v_zones from public.settings where k = 'zones';
  select v into v_slots from public.settings where k = 'slots';
  select v into v_target from public.settings where k = 'unlock_target';
  select v into v_upi from public.settings where k = 'upi';

  return json_build_object(
    'prices', coalesce(v_prices, '{"bites":149,"mix":179,"combo":295}'::jsonb),
    'zone_a', coalesce(v_zones->'A', '{"name":"Nangloi Express","pins":["110041"],"fee":0,"eta":"Today or tomorrow"}'::jsonb),
    'slots', coalesce(v_slots, '["11 am – 2 pm","4 pm – 8 pm"]'::jsonb),
    'unlock_target', coalesce(v_target, '25'::jsonb),
    'upi_vpa', case when (v_upi->>'vpa') <> '' then (v_upi->>'vpa') else '' end
  );
end $$;

-- 13. Public RPC: check_pincode(p_pincode)
create or replace function public.check_pincode(p_pincode text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_pin text := trim(p_pincode);
  v_zones jsonb;
  v_zone_a jsonb;
  v_pins jsonb;
  v_is_a boolean := false;
  v_waitlist_cnt int := 0;
begin
  if v_pin !~ '^[1-9][0-9]{5}$' then
    return json_build_object('deliverable', false, 'error', 'invalid_pin');
  end if;

  select v into v_zones from public.settings where k = 'zones';
  v_zone_a := v_zones->'A';
  v_pins := v_zone_a->'pins';

  if v_pins ? v_pin then
    v_is_a := true;
  end if;

  select count(*) into v_waitlist_cnt from public.waitlist where pincode = v_pin;

  if v_is_a then
    return json_build_object(
      'deliverable', true,
      'zone', 'A',
      'name', coalesce(v_zone_a->>'name', 'Nangloi Express'),
      'fee', 0,
      'eta', coalesce(v_zone_a->>'eta', 'Today or tomorrow'),
      'waitlist_count', v_waitlist_cnt
    );
  else
    return json_build_object(
      'deliverable', false,
      'zone', null,
      'eta', 'Arriving soon',
      'waitlist_count', v_waitlist_cnt
    );
  end if;
end $$;

-- 14. Public RPC: quote_order(p_phone, p_pincode, p_items)
create or replace function public.quote_order(p_phone text, p_pincode text, p_items jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_phone text := public.norm_phone(p_phone);
  v_pin text := trim(p_pincode);
  v_bites int := coalesce((p_items->>'bites')::int, 0);
  v_mix int := coalesce((p_items->>'mix')::int, 0);
  v_combo int := coalesce((p_items->>'combo')::int, 0);
  v_prices jsonb;
  v_p_bites int := 149;
  v_p_mix int := 179;
  v_p_combo int := 295;
  v_subtotal int := 0;
  v_fee int := 0;
  v_total int := 0;
  v_sample_available boolean := false;
  v_sample_flavour text := null;
  v_claim record;
  v_has_prev_order boolean := false;
  v_cust record;
begin
  -- Validate item counts
  if v_bites < 0 or v_bites > 20 or v_mix < 0 or v_mix > 20 or v_combo < 0 or v_combo > 20 then
    return json_build_object('error', 'invalid_qty');
  end if;
  if (v_bites + v_mix + v_combo) < 1 then
    return json_build_object('error', 'empty_cart');
  end if;

  select v into v_prices from public.settings where k = 'prices';
  if v_prices ? 'bites' then v_p_bites := (v_prices->>'bites')::int; end if;
  if v_prices ? 'mix' then v_p_mix := (v_prices->>'mix')::int; end if;
  if v_prices ? 'combo' then v_p_combo := (v_prices->>'combo')::int; end if;

  v_subtotal := (v_bites * v_p_bites) + (v_mix * v_p_mix) + (v_combo * v_p_combo);
  v_fee := 0; -- Zone A Nangloi Express: free delivery
  v_total := v_subtotal + v_fee;

  -- Check sample availability if valid phone provided
  if v_phone ~ '^\+91[6-9][0-9]{9}$' then
    select * into v_cust from public.customers where phone = v_phone;
    if found then
      -- Check if they have an active reserved claim
      select * into v_claim from public.sample_claims where customer_id = v_cust.id and status = 'reserved';
      if found then
        -- Check if any prior non-cancelled orders exist
        select exists(select 1 from public.orders where customer_id = v_cust.id and status <> 'cancelled')
        into v_has_prev_order;
        if not v_has_prev_order then
          v_sample_available := true;
          v_sample_flavour := v_claim.flavour;
        end if;
      end if;
    end if;
  end if;

  return json_build_object(
    'subtotal', v_subtotal,
    'delivery_fee', v_fee,
    'total', v_total,
    'sample_available', v_sample_available,
    'sample_flavour', v_sample_flavour
  );
end $$;

-- 15. Public RPC: place_order(...)
create or replace function public.place_order(
  p_phone text,
  p_name text,
  p_pincode text,
  p_address text,
  p_landmark text,
  p_slot text,
  p_items jsonb,
  p_consent boolean
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_phone text := public.norm_phone(p_phone);
  v_pin text := trim(p_pincode);
  v_name text := trim(p_name);
  v_addr text := trim(p_address);
  v_land text := trim(coalesce(p_landmark, ''));
  v_slot text := trim(coalesce(p_slot, '11 am – 2 pm'));
  v_bites int := coalesce((p_items->>'bites')::int, 0);
  v_mix int := coalesce((p_items->>'mix')::int, 0);
  v_combo int := coalesce((p_items->>'combo')::int, 0);
  v_prices jsonb;
  v_zones jsonb;
  v_p_bites int := 149;
  v_p_mix int := 179;
  v_p_combo int := 295;
  v_subtotal int := 0;
  v_fee int := 0;
  v_total int := 0;
  v_recent_count int := 0;
  v_cust record;
  v_new boolean := false;
  v_claim record;
  v_addr_key text;
  v_sample_added boolean := false;
  v_sample_claim_id uuid := null;
  v_snapshot jsonb := '[]'::jsonb;
  v_public_no text;
  v_token text;
  v_order record;
begin
  -- 1. Validations
  if not coalesce(p_consent, false) then
    return json_build_object('status', 'no_consent', 'message', 'Consent is required to place an order.');
  end if;
  if v_phone !~ '^\+91[6-9][0-9]{9}$' then
    return json_build_object('status', 'bad_phone', 'message', 'Invalid 10-digit mobile number.');
  end if;
  if length(v_name) < 2 then
    return json_build_object('status', 'bad_name', 'message', 'Please provide your full name.');
  end if;
  if length(v_addr) < 10 or length(v_addr) > 300 then
    return json_build_object('status', 'bad_address', 'message', 'Address must be between 10 and 300 characters.');
  end if;

  -- Pincode must be in Zone A
  select v into v_zones from public.settings where k = 'zones';
  if not ((v_zones->'A'->'pins') ? v_pin) then
    return json_build_object('status', 'out_of_area', 'message', 'Delivery is currently available only in Nangloi (110041).');
  end if;

  -- Rate limit: max 5 orders per phone per hour
  select count(*) into v_recent_count
  from public.orders o
  join public.customers c on o.customer_id = c.id
  where c.phone = v_phone and o.created_at > now() - interval '1 hour';

  if v_recent_count >= 5 then
    return json_build_object('status', 'rate_limited', 'message', 'Max 5 orders per hour reached. Please try again shortly or contact support.');
  end if;

  -- Validate items
  if v_bites < 0 or v_bites > 20 or v_mix < 0 or v_mix > 20 or v_combo < 0 or v_combo > 20 or (v_bites + v_mix + v_combo) < 1 then
    return json_build_object('status', 'bad_items', 'message', 'Please select at least 1 valid pack.');
  end if;

  -- 2. Compute Totals
  select v into v_prices from public.settings where k = 'prices';
  if v_prices ? 'bites' then v_p_bites := (v_prices->>'bites')::int; end if;
  if v_prices ? 'mix' then v_p_mix := (v_prices->>'mix')::int; end if;
  if v_prices ? 'combo' then v_p_combo := (v_prices->>'combo')::int; end if;

  v_subtotal := (v_bites * v_p_bites) + (v_mix * v_p_mix) + (v_combo * v_p_combo);
  v_fee := 0;
  v_total := v_subtotal + v_fee;

  -- 3. Upsert Customer
  select * into v_cust from public.customers where phone = v_phone;
  if not found then
    insert into public.customers (phone, name, pincode, customer_code, consent_at, source)
    values (v_phone, left(v_name, 60), v_pin, public.new_code(), now(), 'order_checkout')
    returning * into v_cust;
    v_new := true;
  else
    update public.customers
    set name = coalesce(v_cust.name, left(v_name, 60)),
        pincode = v_pin
    where id = v_cust.id;
  end if;

  -- 4. Build Items Snapshot
  if v_bites > 0 then
    v_snapshot := v_snapshot || jsonb_build_array(jsonb_build_object(
      'id', 'bro-bites', 'name', 'Bro Bites – Classic Crunch (400 g)', 'qty', v_bites, 'price', v_p_bites, 'amount', v_bites * v_p_bites
    ));
  end if;
  if v_mix > 0 then
    v_snapshot := v_snapshot || jsonb_build_array(jsonb_build_object(
      'id', 'bro-mix', 'name', 'Bro Mix – Happy Mix (400 g)', 'qty', v_mix, 'price', v_p_mix, 'amount', v_mix * v_p_mix
    ));
  end if;
  if v_combo > 0 then
    v_snapshot := v_snapshot || jsonb_build_array(jsonb_build_object(
      'id', 'combo', 'name', 'Bro Combo (2 × 400 g)', 'qty', v_combo, 'price', v_p_combo, 'amount', v_combo * v_p_combo
    ));
  end if;

  -- 5. Check Sample Claim Eligibility
  v_addr_key := public.clean_address_key(v_addr, v_pin);
  select * into v_claim from public.sample_claims where customer_id = v_cust.id and status = 'reserved';
  if found then
    -- Check if prior non-cancelled orders exist
    if not exists (select 1 from public.orders where customer_id = v_cust.id and status <> 'cancelled') then
      -- Check address key duplicate
      if not exists (select 1 from public.sample_claims where address_key = v_addr_key and status in ('added', 'given')) then
        v_sample_added := true;
        v_sample_claim_id := v_claim.id;
        v_snapshot := v_snapshot || jsonb_build_array(jsonb_build_object(
          'id', 'sample',
          'name', 'Free 50 g taste pack (' || (case when v_claim.flavour = 'mix' then 'Bro Mix' else 'Bro Bites' end) || ')',
          'qty', 1,
          'price', 0,
          'amount', 0
        ));
      end if;
    end if;
  end if;

  -- 6. Generate Public Number and Security Token
  v_public_no := public.next_order_public_no();
  v_token := encode(gen_random_bytes(12), 'hex');

  -- 7. Insert Order
  insert into public.orders (
    customer_id, items, subtotal, delivery_fee, total,
    channel, status, payment_method, payment_status,
    public_no, token, pincode, zone, address, landmark, slot,
    sample_claim_id
  ) values (
    v_cust.id, v_snapshot, v_subtotal, v_fee, v_total,
    'site', 'placed', 'cod', 'unpaid',
    v_public_no, v_token, v_pin, 'A', v_addr, v_land, v_slot,
    v_sample_claim_id
  ) returning * into v_order;

  -- Update Sample Claim if added
  if v_sample_added and v_sample_claim_id is not null then
    update public.sample_claims
    set status = 'added',
        order_id = v_order.id,
        address_key = v_addr_key
    where id = v_sample_claim_id;
  end if;

  return json_build_object(
    'status', 'ok',
    'public_no', v_public_no,
    'token', v_token,
    'subtotal', v_subtotal,
    'total', v_total,
    'sample_added', v_sample_added,
    'customer_code', case when v_new then v_cust.customer_code else null end
  );
end $$;

-- 16. Public RPC: get_order(p_no, p_token)
create or replace function public.get_order(p_no text, p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_order record;
  v_cust record;
  v_doc record;
  v_bill jsonb := null;
  v_business jsonb;
  v_masked_phone text;
begin
  select * into v_order from public.orders
  where public_no = upper(trim(p_no)) and token = trim(p_token);

  if not found then
    return json_build_object('status', 'not_found');
  end if;

  select * into v_cust from public.customers where id = v_order.customer_id;
  v_masked_phone := '••••••' || right(coalesce(v_cust.phone, '9999999999'), 4);

  -- Include bill block only if bill_requested is true and bill exists
  if v_order.bill_requested then
    select * into v_doc from public.documents
    where order_id = v_order.id and doc_type = 'bill' and status = 'active';

    if found then
      select v into v_business from public.settings where k = 'business';
      v_bill := json_build_object(
        'doc_no', v_doc.doc_no,
        'doc_date', v_doc.doc_date,
        'business_name', coalesce(v_business->>'name', 'BROSKI'),
        'gstin', coalesce(v_business->>'gstin', ''),
        'bill_address', coalesce(v_business->>'bill_address', ''),
        'state', coalesce(v_business->>'state', 'Delhi (07)'),
        'hsn', coalesce(v_business->>'hsn', '2309'),
        'total', v_doc.total,
        'token', v_doc.token
      );
    end if;
  end if;

  return json_build_object(
    'status', 'ok',
    'public_no', v_order.public_no,
    'date', v_order.created_at,
    'order_status', v_order.status,
    'customer_name', v_cust.name,
    'masked_phone', v_masked_phone,
    'address', v_order.address,
    'landmark', v_order.landmark,
    'pincode', v_order.pincode,
    'slot', v_order.slot,
    'items', v_order.items,
    'subtotal', v_order.subtotal,
    'delivery_fee', v_order.delivery_fee,
    'total', v_order.total,
    'payment_method', v_order.payment_method,
    'payment_status', v_order.payment_status,
    'bill_requested', v_order.bill_requested,
    'bill', v_bill
  );
end $$;

-- 17. Public RPC: request_bill(p_no, p_token)
create or replace function public.request_bill(p_no text, p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_order record;
  v_bill_res json;
  v_doc record;
begin
  select * into v_order from public.orders
  where public_no = upper(trim(p_no)) and token = trim(p_token);

  if not found then
    return json_build_object('status', 'not_found');
  end if;

  update public.orders set bill_requested = true where id = v_order.id;

  -- If order is paid or delivered, issue bill now if not already issued
  if v_order.status = 'delivered' or v_order.payment_status = 'paid' then
    v_bill_res := public.issue_bill_for_order(v_order.id);
  end if;

  select * into v_doc from public.documents where order_id = v_order.id and doc_type = 'bill' and status = 'active';

  return json_build_object(
    'status', 'ok',
    'bill_issued', v_doc.doc_no is not null,
    'doc_no', v_doc.doc_no,
    'token', v_doc.token
  );
end $$;

-- 18. Public RPC: join_waitlist(...)
create or replace function public.join_waitlist(
  p_phone text,
  p_name text,
  p_pincode text,
  p_consent boolean
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_phone text := public.norm_phone(p_phone);
  v_pin text := trim(p_pincode);
  v_today_cnt int;
  v_total_cnt int;
begin
  if not coalesce(p_consent, false) then
    return json_build_object('status', 'no_consent', 'message', 'Consent is required to join the waitlist.');
  end if;
  if v_phone !~ '^\+91[6-9][0-9]{9}$' then
    return json_build_object('status', 'bad_phone', 'message', 'Invalid 10-digit mobile number.');
  end if;
  if v_pin !~ '^[1-9][0-9]{5}$' then
    return json_build_object('status', 'bad_pincode', 'message', 'Invalid 6-digit Indian pincode.');
  end if;

  -- Max 3 waitlist attempts per phone per day
  select count(*) into v_today_cnt from public.waitlist
  where phone = v_phone and created_at > now() - interval '1 day';

  if v_today_cnt >= 3 then
    return json_build_object('status', 'too_many', 'message', 'You have already submitted waitlist requests today.');
  end if;

  insert into public.waitlist (phone, name, pincode)
  values (v_phone, left(trim(coalesce(p_name, '')), 60), v_pin)
  on conflict (phone, pincode) do update
  set name = coalesce(excluded.name, public.waitlist.name);

  select count(*) into v_total_cnt from public.waitlist where pincode = v_pin;

  return json_build_object(
    'status', 'ok',
    'pincode', v_pin,
    'waitlist_count', v_total_cnt
  );
end $$;

-- 19. Public RPC: claim_sample(...) [Updated for V2]
drop function if exists public.claim_sample(text, text, text, text, boolean, text, text);
drop function if exists public.claim_sample(text, text, text, text, boolean, text, text, text);
create or replace function public.claim_sample(
  p_phone text,
  p_name text,
  p_pincode text,
  p_flavour text,
  p_consent boolean,
  p_mode text default 'with_order',
  p_device text default null,
  p_source text default null
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_phone text := public.norm_phone(p_phone);
  v_pin text := trim(p_pincode);
  v_cust public.customers;
  v_claim public.sample_claims;
  v_new boolean := false;
  v_mode text := case when p_mode in ('with_order','route_drop','shop') then p_mode else 'with_order' end;
begin
  if not coalesce(p_consent, false) then return json_build_object('status','no_consent'); end if;
  if v_phone !~ '^\+91[6-9][0-9]{9}$' then return json_build_object('status','bad_phone'); end if;
  if p_flavour not in ('bites','mix') then return json_build_object('status','bad_flavour'); end if;

  -- Route drop is only allowed for Zone A (110041)
  if v_mode = 'route_drop' and v_pin <> '110041' then
    v_mode := 'with_order';
  end if;

  select * into v_cust from public.customers where phone = v_phone;
  if found then
    select * into v_claim from public.sample_claims where customer_id = v_cust.id;
    if found then
      return json_build_object('status', 'already_claimed', 'claim_status', v_claim.status);
    end if;
  else
    insert into public.customers (phone, name, pincode, customer_code, consent_at, source)
    values (v_phone, left(trim(p_name), 60), v_pin, public.new_code(), now(), left(p_source, 100))
    returning * into v_cust;
    v_new := true;
  end if;

  insert into public.sample_claims (customer_id, claim_code, flavour, status, mode, device_id)
  values (v_cust.id, public.new_code(), p_flavour, 'reserved', v_mode, left(p_device, 64))
  returning * into v_claim;

  return json_build_object(
    'status', case when v_new then 'ok' else 'ok_existing' end,
    'claim_code', v_claim.claim_code,
    'mode', v_mode,
    'customer_code', case when v_new then v_cust.customer_code else null end
  );
end $$;

-- 20. Public RPC: get_document(p_no, p_token)
create or replace function public.get_document(p_no text, p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_doc record;
  v_party record;
  v_business jsonb;
  v_upi jsonb;
begin
  select * into v_doc from public.documents
  where doc_no = upper(trim(p_no)) and token = trim(p_token);

  if not found then
    return json_build_object('status', 'not_found');
  end if;

  if v_doc.party_id is not null then
    select * into v_party from public.parties where id = v_doc.party_id;
  end if;

  select v into v_business from public.settings where k = 'business';
  select v into v_upi from public.settings where k = 'upi';

  return json_build_object(
    'status', 'ok',
    'doc_type', v_doc.doc_type,
    'doc_no', v_doc.doc_no,
    'fy', v_doc.fy,
    'doc_date', v_doc.doc_date,
    'items', v_doc.items,
    'subtotal', v_doc.subtotal,
    'discount', v_doc.discount,
    'total', v_doc.total,
    'payment_method', v_doc.payment_method,
    'payment_status', v_doc.payment_status,
    'due_date', v_doc.due_date,
    'notes', v_doc.notes,
    'doc_status', v_doc.status,
    'cancel_reason', v_doc.cancel_reason,
    'party', case when v_party.id is not null then json_build_object(
      'name', v_party.name,
      'phone', v_party.phone,
      'area', v_party.area,
      'address', v_party.address,
      'gstin', v_party.gstin
    ) else v_doc.meta end,
    'business', v_business,
    'upi_vpa', coalesce(v_upi->>'vpa', '')
  );
end $$;

-- 21. Daily Consolidated Bill Function (for orders under 200)
create or replace function public.issue_daily_consolidated(p_date date default current_date) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_fy text := public.current_fy();
  v_doc_no text;
  v_orders record;
  v_order_ids uuid[] := array[]::uuid[];
  v_order_nos text[] := array[]::text[];
  v_total int := 0;
  v_count int := 0;
  v_existing record;
begin
  -- Check if daily doc for this date already exists
  select * into v_existing from public.documents
  where doc_type = 'daily' and doc_date = p_date and status = 'active';

  if found then
    return json_build_object('status', 'already_issued', 'doc_no', v_existing.doc_no, 'total', v_existing.total);
  end if;

  -- Find all eligible online orders for this date:
  -- Status in ('delivered') or payment_status = 'paid', total < 200, bill_requested = false, not already in documents
  for v_orders in
    select o.id, o.public_no, o.total
    from public.orders o
    where date(o.created_at at time zone 'Asia/Kolkata') = p_date
      and (o.status = 'delivered' or o.payment_status = 'paid')
      and o.total < 200
      and o.bill_requested = false
      and not exists (
        select 1 from public.documents d where d.order_id = o.id and d.status = 'active'
      )
  loop
    v_order_ids := array_append(v_order_ids, v_orders.id);
    v_order_nos := array_append(v_order_nos, v_orders.public_no);
    v_total := v_total + v_orders.total;
    v_count := v_count + 1;
  end loop;

  if v_count = 0 then
    return json_build_object('status', 'no_orders', 'message', 'No unbilled orders under Rs 200 for this date.');
  end if;

  v_doc_no := public.next_doc_no('daily');

  insert into public.documents (
    doc_type, doc_no, fy, doc_date, subtotal, discount, total,
    payment_method, payment_status,
    meta
  ) values (
    'daily', v_doc_no, v_fy, p_date, v_total, 0, v_total,
    'cod', 'paid',
    jsonb_build_object(
      'order_ids', v_order_ids,
      'order_nos', v_order_nos,
      'count', v_count,
      'date', p_date
    )
  );

  return json_build_object(
    'status', 'ok',
    'doc_no', v_doc_no,
    'count', v_count,
    'total', v_total
  );
end $$;

-- 22. Admin RPCs
create or replace function public.admin_set_status(p_order_id uuid, p_status text) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;
  if p_status not in ('placed','confirmed','out_for_delivery','delivered','cancelled') then
    return json_build_object('error', 'invalid_status');
  end if;

  update public.orders set status = p_status where id = p_order_id;
  return json_build_object('status', 'ok', 'order_id', p_order_id, 'new_status', p_status);
end $$;

create or replace function public.admin_mark_paid(p_order_id uuid, p_method text, p_utr text default null) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;

  update public.orders
  set payment_status = 'paid',
      payment_method = coalesce(p_method, payment_method),
      utr = coalesce(p_utr, utr),
      paid_at = now()
  where id = p_order_id;

  return json_build_object('status', 'ok', 'order_id', p_order_id);
end $$;

create or replace function public.admin_cancel_order(p_order_id uuid, p_reason text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_order record;
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;

  select * into v_order from public.orders where id = p_order_id;
  if not found then return json_build_object('error', 'not_found'); end if;

  update public.orders
  set status = 'cancelled',
      cancel_reason = p_reason
  where id = p_order_id;

  -- If a sample claim was added, revert it back to reserved
  if v_order.sample_claim_id is not null then
    update public.sample_claims
    set status = 'reserved', order_id = null, address_key = null
    where id = v_order.sample_claim_id and status = 'added';
  end if;

  return json_build_object('status', 'ok', 'order_id', p_order_id);
end $$;

create or replace function public.admin_issue_bill(p_order_id uuid) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;
  return public.issue_bill_for_order(p_order_id);
end $$;

create or replace function public.admin_create_document(
  p_doc_type text,
  p_party_id uuid,
  p_items jsonb,
  p_subtotal int,
  p_discount int,
  p_total int,
  p_payment_method text,
  p_payment_status text,
  p_due_date date,
  p_notes text,
  p_party_data jsonb default null
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_fy text := public.current_fy();
  v_doc_no text;
  v_party_id uuid := p_party_id;
  v_doc record;
  v_order record;
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;

  -- Create party if new shop or customer info passed without party_id
  if v_party_id is null and p_party_data is not null and (p_party_data->>'name') is not null then
    insert into public.parties (
      kind, name, phone, area, address, gstin
    ) values (
      coalesce(p_party_data->>'kind', 'walkin'),
      p_party_data->>'name',
      p_party_data->>'phone',
      p_party_data->>'area',
      p_party_data->>'address',
      p_party_data->>'gstin'
    ) returning id into v_party_id;
  end if;

  v_doc_no := public.next_doc_no(p_doc_type);

  insert into public.documents (
    doc_type, doc_no, fy, doc_date, party_id, items,
    subtotal, discount, total, payment_method, payment_status,
    due_date, notes, meta
  ) values (
    p_doc_type, v_doc_no, v_fy, current_date, v_party_id, p_items,
    p_subtotal, p_discount, p_total, p_payment_method, p_payment_status,
    p_due_date, p_notes, coalesce(p_party_data, '{}'::jsonb)
  ) returning * into v_doc;

  -- For estimate or bill, record an offline sale in orders table for unified reporting
  if p_doc_type in ('estimate', 'bill') then
    insert into public.orders (
      items, subtotal, delivery_fee, total,
      channel, status, payment_method, payment_status,
      public_no, token, bill_no, bill_date,
      customer_id
    ) values (
      p_items, p_subtotal, 0, p_total,
      'offline', 'delivered', p_payment_method, p_payment_status,
      'OFF-' || v_doc_no, v_doc.token, case when p_doc_type = 'bill' then v_doc_no else null end, current_date,
      (select id from public.customers limit 1) -- dummy linkage or standalone
    ) returning * into v_order;

    update public.documents set order_id = v_order.id where id = v_doc.id;
  end if;

  return json_build_object(
    'status', 'ok',
    'id', v_doc.id,
    'doc_no', v_doc_no,
    'token', v_doc.token
  );
end $$;

create or replace function public.admin_convert_document(p_id uuid, p_to_type text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_old record;
  v_doc_no text;
  v_fy text := public.current_fy();
  v_new record;
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;

  select * into v_old from public.documents where id = p_id;
  if not found then return json_build_object('error', 'not_found'); end if;

  v_doc_no := public.next_doc_no(p_to_type);

  insert into public.documents (
    doc_type, doc_no, fy, doc_date, party_id, order_id, items,
    subtotal, discount, total, payment_method, payment_status,
    due_date, notes, converted_from, meta
  ) values (
    p_to_type, v_doc_no, v_fy, current_date, v_old.party_id, v_old.order_id, v_old.items,
    v_old.subtotal, v_old.discount, v_old.total, v_old.payment_method, v_old.payment_status,
    v_old.due_date, v_old.notes, v_old.id, v_old.meta
  ) returning * into v_new;

  -- Update order record if already linked
  if v_old.order_id is not null and p_to_type = 'bill' then
    update public.orders set bill_no = v_doc_no, bill_date = current_date where id = v_old.order_id;
  end if;

  return json_build_object(
    'status', 'ok',
    'id', v_new.id,
    'doc_no', v_doc_no,
    'token', v_new.token
  );
end $$;

create or replace function public.admin_cancel_document(p_id uuid, p_reason text) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;

  update public.documents
  set status = 'cancelled',
      cancel_reason = p_reason
  where id = p_id;

  return json_build_object('status', 'ok', 'id', p_id);
end $$;

create or replace function public.admin_mark_doc_paid(p_id uuid, p_method text default 'cash') returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;

  update public.documents
  set payment_status = 'paid',
      payment_method = coalesce(p_method, payment_method)
  where id = p_id;

  return json_build_object('status', 'ok', 'id', p_id);
end $$;

create or replace function public.admin_update_settings(p_key text, p_val jsonb) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;

  insert into public.settings (k, v)
  values (p_key, p_val)
  on conflict (k) do update
  set v = p_val;

  return json_build_object('status', 'ok', 'key', p_key);
end $$;

create or replace function public.admin_mark_sample(p_claim_id uuid, p_status text) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;
  if p_status not in ('reserved','added','given','expired','rejected') then
    return json_build_object('error', 'invalid_status');
  end if;

  update public.sample_claims
  set status = p_status,
      given_at = case when p_status = 'given' then now() else given_at end
  where id = p_claim_id;

  return json_build_object('status', 'ok', 'claim_id', p_claim_id, 'new_status', p_status);
end $$;

-- 23. Permissions Configuration
revoke all on function public.current_fy from public;
revoke all on function public.clean_address_key from public;
revoke all on function public.next_doc_no from public;
revoke all on function public.next_order_public_no from public;
revoke all on function public.expire_old_sample_claims from public;
revoke all on function public.issue_bill_for_order from public;
revoke all on function public.issue_daily_consolidated from public;

revoke all on function public.get_shop_settings from public;
revoke all on function public.check_pincode from public;
revoke all on function public.quote_order from public;
revoke all on function public.place_order from public;
revoke all on function public.get_order from public;
revoke all on function public.request_bill from public;
revoke all on function public.join_waitlist from public;
revoke all on function public.claim_sample(text, text, text, text, boolean, text, text, text) from public;
revoke all on function public.get_document from public;

-- Grant public execution to anon and authenticated
grant execute on function public.get_shop_settings to anon, authenticated;
grant execute on function public.check_pincode to anon, authenticated;
grant execute on function public.quote_order to anon, authenticated;
grant execute on function public.place_order to anon, authenticated;
grant execute on function public.get_order to anon, authenticated;
grant execute on function public.request_bill to anon, authenticated;
grant execute on function public.join_waitlist to anon, authenticated;
grant execute on function public.claim_sample(text, text, text, text, boolean, text, text, text) to anon, authenticated;
grant execute on function public.get_document to anon, authenticated;

-- Grant admin execution to authenticated (and anon, protected internally by is_admin())
grant execute on function public.admin_set_status to anon, authenticated;
grant execute on function public.admin_mark_paid to anon, authenticated;
grant execute on function public.admin_cancel_order to anon, authenticated;
grant execute on function public.admin_issue_bill to anon, authenticated;
grant execute on function public.admin_create_document to anon, authenticated;
grant execute on function public.admin_convert_document to anon, authenticated;
grant execute on function public.admin_cancel_document to anon, authenticated;
grant execute on function public.admin_mark_doc_paid to anon, authenticated;
grant execute on function public.admin_update_settings to anon, authenticated;
grant execute on function public.admin_mark_sample to anon, authenticated;
grant execute on function public.issue_daily_consolidated to anon, authenticated;
grant execute on function public.expire_old_sample_claims to anon, authenticated;

-- ==============================================================================
-- End of Migration Script
-- ==============================================================================
