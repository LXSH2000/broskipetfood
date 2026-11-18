-- ==============================================================================
-- BROSKI Customer Portal & Orders Schema
-- Target: Supabase Postgres
-- Run once in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Safe to re-run anytime (idempotent, drops existing policies before recreating)
-- ==============================================================================

-- 1. Tables
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null check (phone ~ '^\+91[6-9][0-9]{9}$'),
  name text,
  pincode text check (pincode ~ '^[0-9]{6}$'),
  customer_code text unique not null,
  wa_verified boolean not null default false,
  consent_at timestamptz not null default now(),
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.sample_claims (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid unique not null references public.customers(id) on delete cascade,
  claim_code text unique not null,
  flavour text not null check (flavour in ('bites','mix')),
  status text not null default 'pending' check (status in ('pending','verified','handed','rejected')),
  device_id text,
  handed_by text,
  handed_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  items jsonb not null,
  total int not null,
  channel text not null default 'site' check (channel in ('site','whatsapp','shop')),
  status text not null default 'requested' check (status in ('requested','confirmed','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  flavour text check (flavour in ('bites','mix')),
  batch_no text,
  rating int check (rating between 1 and 5),
  comments text check (char_length(comments) <= 1000),
  quote_ok boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  delta int not null,
  reason text not null,
  ref uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- 2. Row Level Security (RLS)
alter table public.customers enable row level security;
alter table public.sample_claims enable row level security;
alter table public.orders enable row level security;
alter table public.feedback enable row level security;
alter table public.points_ledger enable row level security;
alter table public.admins enable row level security;

-- Admin check helper
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- Drop existing policies first so re-running never fails with ERROR 42710
drop policy if exists admin_all on public.customers;
drop policy if exists admin_all on public.sample_claims;
drop policy if exists admin_all on public.orders;
drop policy if exists admin_all on public.feedback;
drop policy if exists admin_all on public.points_ledger;
drop policy if exists admin_read on public.admins;

-- Recreate policies
create policy admin_all on public.customers     for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.sample_claims for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.orders        for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.feedback      for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.points_ledger for all using (public.is_admin()) with check (public.is_admin());
create policy admin_read on public.admins       for select using (user_id = auth.uid());

-- 3. Helpers
create or replace function public.norm_phone(p text) returns text language sql immutable as
$$ select '+91' || right(regexp_replace(coalesce(p,''), '[^0-9]', '', 'g'), 10) $$;

create or replace function public.new_code() returns text language sql volatile as
$$ select upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)) $$;

-- 4. Public RPC Functions
create or replace function public.claim_sample(p_phone text, p_name text, p_pincode text,
  p_flavour text, p_consent boolean, p_device text default null, p_source text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_phone text := public.norm_phone(p_phone); v_cust public.customers; v_claim public.sample_claims; v_new boolean := false;
begin
  if not coalesce(p_consent,false) then return json_build_object('status','no_consent'); end if;
  if v_phone !~ '^\+91[6-9][0-9]{9}$' then return json_build_object('status','bad_phone'); end if;
  if p_flavour not in ('bites','mix') then return json_build_object('status','bad_flavour'); end if;

  select * into v_cust from public.customers where phone = v_phone;
  if found then
    select * into v_claim from public.sample_claims where customer_id = v_cust.id;
    if found then
      return json_build_object('status','already_claimed','claim_status',v_claim.status);
    end if;
  else
    insert into public.customers(phone,name,pincode,customer_code,consent_at,source)
    values (v_phone, left(trim(p_name),60), p_pincode, public.new_code(), now(), left(p_source,100))
    returning * into v_cust;
    v_new := true;
  end if;

  insert into public.sample_claims(customer_id, claim_code, flavour, device_id)
  values (v_cust.id, public.new_code(), p_flavour, left(p_device,64))
  returning * into v_claim;

  return json_build_object('status','ok','claim_code',v_claim.claim_code,
    'customer_code', case when v_new then v_cust.customer_code else null end);
end $$;

create or replace function public.submit_feedback(p_flavour text, p_batch text, p_rating int,
  p_comments text, p_quote_ok boolean, p_phone text default null, p_code text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_cust_id uuid;
begin
  if coalesce(trim(p_phone),'') <> '' and coalesce(trim(p_code),'') <> '' then
    select id into v_cust_id from public.customers
    where phone = public.norm_phone(p_phone) and customer_code = upper(trim(p_code));
  end if;
  insert into public.feedback(customer_id, flavour, batch_no, rating, comments, quote_ok)
  values (v_cust_id, p_flavour, left(p_batch,30), p_rating, left(p_comments,1000), coalesce(p_quote_ok,false));
  return json_build_object('status','ok','linked', v_cust_id is not null);
end $$;

create or replace function public.create_order_request(p_phone text, p_name text, p_pincode text,
  p_items jsonb, p_total int, p_consent boolean)
returns json language plpgsql security definer set search_path = public as $$
declare v_phone text := public.norm_phone(p_phone); v_cust public.customers; v_order public.orders; v_new boolean := false;
begin
  if not coalesce(p_consent,false) then return json_build_object('status','no_consent'); end if;
  if v_phone !~ '^\+91[6-9][0-9]{9}$' then return json_build_object('status','bad_phone'); end if;
  select * into v_cust from public.customers where phone = v_phone;
  if not found then
    insert into public.customers(phone,name,pincode,customer_code,consent_at)
    values (v_phone, left(trim(p_name),60), p_pincode, public.new_code(), now()) returning * into v_cust;
    v_new := true;
  end if;
  insert into public.orders(customer_id, items, total) values (v_cust.id, p_items, p_total) returning * into v_order;
  return json_build_object('status','ok','order_id', left(v_order.id::text,8),
    'customer_code', case when v_new then v_cust.customer_code else null end);
end $$;

create or replace function public.get_my_summary(p_phone text, p_code text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_cust public.customers;
begin
  if p_code is null or trim(p_code) = '' then
    return json_build_object('status','code_required');
  end if;
  select * into v_cust from public.customers
  where phone = public.norm_phone(p_phone) and customer_code = upper(trim(p_code));
  if not found then return json_build_object('status','not_found'); end if;
  return json_build_object(
    'status','ok',
    'name', v_cust.name,
    'points', coalesce((select sum(delta) from public.points_ledger where customer_id = v_cust.id),0),
    'sample', (select status from public.sample_claims where customer_id = v_cust.id),
    'orders', coalesce((select json_agg(json_build_object('date',created_at,'items',items,'total',total,'status',status) order by created_at desc)
                        from public.orders where customer_id = v_cust.id),'[]'::json),
    'history', coalesce((select json_agg(json_build_object('date',created_at,'delta',delta,'reason',reason) order by created_at desc)
                         from public.points_ledger where customer_id = v_cust.id),'[]'::json)
  );
end $$;

-- 5. Permissions
revoke all on function public.claim_sample, public.submit_feedback, public.create_order_request, public.get_my_summary from public;
grant execute on function public.claim_sample, public.submit_feedback, public.create_order_request, public.get_my_summary to anon, authenticated;

-- 6. Grant Admin to Lakshay (support@broskipetfood.com, UID 0b57ec82-e384-4d67-abb0-2467e8698075)
insert into public.admins (user_id) values ('0b57ec82-e384-4d67-abb0-2467e8698075')
on conflict (user_id) do nothing;
