-- BROSKI Order System v2 – PATCH (23 Nov 2026) – run AFTER supabase/order_system_v2.sql
-- Safe to run more than once. Supabase → SQL Editor → paste all → Run.

-- 1) place_order uses gen_random_bytes (pgcrypto lives in the "extensions" schema on Supabase).
--    Its search_path is only "public", so placing an order can fail. Let it see "extensions".
alter function public.place_order set search_path = public, extensions;

-- 2) Bills for orders >= ₹200 were issued inside a BEFORE trigger that updates the same row
--    → "tuple already modified" error when marking Delivered/Paid. Move bill issuing to an AFTER trigger.
create or replace function public.on_order_status_update() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_pts jsonb; v_per int := 10; v_points int;
begin
  NEW.updated_at := now();
  if NEW.status = 'delivered' and (OLD.status is distinct from 'delivered') then
    select v into v_pts from public.settings where k = 'points';
    if v_pts ? 'per_rupees' and (v_pts->>'per_rupees')::int > 0 then
      v_per := (v_pts->>'per_rupees')::int;
    end if;
    v_points := floor(NEW.total / v_per);
    -- points only once per order, even if status is changed back and forth
    if v_points > 0 and not exists (
      select 1 from public.points_ledger where ref = NEW.id and reason like 'Delivered order%') then
      insert into public.points_ledger (customer_id, delta, reason, ref)
      values (NEW.customer_id, v_points, 'Delivered order ' || coalesce(NEW.public_no, ''), NEW.id);
    end if;
    if NEW.sample_claim_id is not null then
      update public.sample_claims set status = 'given', given_at = now()
      where id = NEW.sample_claim_id and status = 'added';
    end if;
  end if;
  if NEW.payment_status = 'paid' and (OLD.payment_status is distinct from 'paid') and NEW.paid_at is null then
    NEW.paid_at := now();
  end if;
  return NEW;
end $$;

create or replace function public.on_order_after_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if NEW.total >= 200 and NEW.bill_no is null and (
       (NEW.status = 'delivered' and OLD.status is distinct from 'delivered')
    or (NEW.payment_status = 'paid' and OLD.payment_status is distinct from 'paid')) then
    perform public.issue_bill_for_order(NEW.id);
  end if;
  return null;
end $$;

drop trigger if exists trg_order_after_update on public.orders;
create trigger trg_order_after_update
  after update on public.orders
  for each row execute function public.on_order_after_update();

-- 3) "Close day" (daily combined bill) must be admin-only.
create or replace function public.admin_close_day(p_date date default current_date) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then return json_build_object('error', 'unauthorized'); end if;
  return public.issue_daily_consolidated(p_date);
end $$;

-- 4) Lock internal functions. On Supabase, new functions are executable by anon/authenticated
--    by default, so "revoke ... from public" alone is not enough. Without this, anyone could
--    burn bill numbers (next_doc_no) or close the day early.
revoke execute on function public.current_fy() from public, anon, authenticated;
revoke execute on function public.clean_address_key(text, text) from public, anon, authenticated;
revoke execute on function public.next_doc_no(text) from public, anon, authenticated;
revoke execute on function public.next_order_public_no() from public, anon, authenticated;
revoke execute on function public.issue_bill_for_order(uuid) from public, anon, authenticated;
revoke execute on function public.issue_daily_consolidated(date) from public, anon, authenticated;
revoke execute on function public.admin_close_day(date) from public, anon;
grant  execute on function public.admin_close_day(date) to authenticated;

-- Quick check (should list ONLY the intended public RPCs for anon):
-- select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute') order by 1;
