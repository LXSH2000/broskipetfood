-- ==============================================================================
-- BROSKI Customer Portal & Orders Schema
-- Target: Supabase Postgres
-- Run once in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- Tables
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null check (phone ~ '^\+91[6-9][0-9]{9}$'),
  name text,
  pincode text check (pincode ~ '^[0-9]{6}$'),
  customer_code text unique not null,
  wa_verified boolean not null default false,
  consent_at timestamptz not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists sample_claims (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid unique not null references customers(id) on delete cascade, -- one per person
  claim_code text unique not null,
  flavour text not null check (flavour in ('bites','mix')),
  status text not null default 'pending' check (status in ('pending','verified','handed','rejected')),
  device_id text,
  handed_by text,
  handed_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  items jsonb not null,            -- e.g. {"bites":1,"mix":0,"combo":1}
  total int not null,              -- rupees, from config prices
  channel text not null default 'site' check (channel in ('site','whatsapp','shop')),
  status text not null default 'requested' check (status in ('requested','confirmed','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  flavour text check (flavour in ('bites','mix')),
  batch_no text,
  rating int check (rating between 1 and 5),
  comments text check (char_length(comments) <= 1000),
  quote_ok boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists points_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  delta int not null,
  reason text not null,
  ref uuid,
  created_at timestamptz not null default now()
);

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Lock everything; only admins can read/write tables directly
alter table customers enable row level security;
alter table sample_claims enable row level security;
alter table orders enable row level security;
alter table feedback enable row level security;
alter table points_ledger enable row level security;
alter table admins enable row level security;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

-- Drop existing policies if re-running
drop policy if exists admin_all on customers;
drop policy if exists admin_all on sample_claims;
drop policy if exists admin_all on orders;
drop policy if exists admin_all on feedback;
drop policy if exists admin_all on points_ledger;
drop policy if exists admin_read on admins;

create policy admin_all on customers     for all using (is_admin()) with check (is_admin());
create policy admin_all on sample_claims for all using (is_admin()) with check (is_admin());
create policy admin_all on orders        for all using (is_admin()) with check (is_admin());
create policy admin_all on feedback      for all using (is_admin()) with check (is_admin());
create policy admin_all on points_ledger for all using (is_admin()) with check (is_admin());
create policy admin_read on admins       for select using (user_id = auth.uid());

-- Helpers
create or replace function norm_phone(p text) returns text language sql immutable as
$$ select '+91' || right(regexp_replace(coalesce(p,''), '[^0-9]', '', 'g'), 10) $$;

create or replace function new_code() returns text language sql volatile as
$$ select upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)) $$;

-- Public RPC: claim sample
create or replace function claim_sample(p_phone text, p_name text, p_pincode text,
  p_flavour text, p_consent boolean, p_device text default null, p_source text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_phone text := norm_phone(p_phone); v_cust customers; v_claim sample_claims;
begin
  if not coalesce(p_consent,false) then return json_build_object('status','no_consent'); end if;
  if v_phone !~ '^\+91[6-9][0-9]{9}$' then return json_build_object('status','bad_phone'); end if;
  if p_flavour not in ('bites','mix') then return json_build_object('status','bad_flavour'); end if;

  select * into v_cust from customers where phone = v_phone;
  if found then
    select * into v_claim from sample_claims where customer_id = v_cust.id;
    if found then
      return json_build_object('status','already_claimed','claim_status',v_claim.status);
    end if;
  else
    insert into customers(phone,name,pincode,customer_code,consent_at,source)
    values (v_phone, left(trim(p_name),60), p_pincode, new_code(), now(), left(p_source,100))
    returning * into v_cust;
  end if;

  insert into sample_claims(customer_id, claim_code, flavour, device_id)
  values (v_cust.id, new_code(), p_flavour, left(p_device,64))
  returning * into v_claim;

  return json_build_object('status','ok','claim_code',v_claim.claim_code);
end $$;

-- Public RPC: feedback (points are given by admin only)
create or replace function submit_feedback(p_flavour text, p_batch text, p_rating int,
  p_comments text, p_quote_ok boolean, p_phone text default null, p_code text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_cust_id uuid;
begin
  if p_phone is not null and p_code is not null then
    select id into v_cust_id from customers
    where phone = norm_phone(p_phone) and customer_code = upper(trim(p_code));
  end if;
  insert into feedback(customer_id, flavour, batch_no, rating, comments, quote_ok)
  values (v_cust_id, p_flavour, left(p_batch,30), p_rating, left(p_comments,1000), coalesce(p_quote_ok,false));
  return json_build_object('status','ok','linked', v_cust_id is not null);
end $$;

-- Public RPC: order request
create or replace function create_order_request(p_phone text, p_name text, p_pincode text,
  p_items jsonb, p_total int, p_consent boolean)
returns json language plpgsql security definer set search_path = public as $$
declare v_phone text := norm_phone(p_phone); v_cust customers; v_order orders;
begin
  if not coalesce(p_consent,false) then return json_build_object('status','no_consent'); end if;
  if v_phone !~ '^\+91[6-9][0-9]{9}$' then return json_build_object('status','bad_phone'); end if;
  select * into v_cust from customers where phone = v_phone;
  if not found then
    insert into customers(phone,name,pincode,customer_code,consent_at)
    values (v_phone, left(trim(p_name),60), p_pincode, new_code(), now()) returning * into v_cust;
  end if;
  insert into orders(customer_id, items, total) values (v_cust.id, p_items, p_total) returning * into v_order;
  return json_build_object('status','ok','order_id', left(v_order.id::text,8));
end $$;

-- Public RPC: My BROSKI summary (needs phone + customer code)
create or replace function get_my_summary(p_phone text, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_cust customers;
begin
  select * into v_cust from customers
  where phone = norm_phone(p_phone) and customer_code = upper(trim(p_code));
  if not found then return json_build_object('status','not_found'); end if;
  return json_build_object(
    'status','ok',
    'name', v_cust.name,
    'points', coalesce((select sum(delta) from points_ledger where customer_id = v_cust.id),0),
    'sample', (select status from sample_claims where customer_id = v_cust.id),
    'orders', coalesce((select json_agg(json_build_object('date',created_at,'items',items,'total',total,'status',status) order by created_at desc)
                        from orders where customer_id = v_cust.id),'[]'::json),
    'history', coalesce((select json_agg(json_build_object('date',created_at,'delta',delta,'reason',reason) order by created_at desc)
                         from points_ledger where customer_id = v_cust.id),'[]'::json)
  );
end $$;

-- Only these functions are callable by the public
revoke all on function claim_sample, submit_feedback, create_order_request, get_my_summary from public;
grant execute on function claim_sample, submit_feedback, create_order_request, get_my_summary to anon, authenticated;
