-- BROSKI – Billing upgrade (24 Nov 2026)
-- 1) FIXES get_document: it crashed for every document (json/jsonb mix + walk-in "record not assigned"),
--    so /doc links showed "not found". 2) Adds partial payments (idea from invoice-builder).
-- Supabase → SQL Editor → paste all → Run. Safe to run twice.

-- 1) Documents can now be partly paid
alter table public.documents add column if not exists paid_amount int not null default 0;
alter table public.documents drop constraint if exists documents_payment_status_check;
alter table public.documents add constraint documents_payment_status_check
  check (payment_status in ('paid','unpaid','partial'));
-- Old "paid" documents: mark the full amount as received
update public.documents set paid_amount = total
where payment_status = 'paid' and paid_amount = 0;

-- Documents saved as "paid" (new bills, or the old "Mark paid" button) count as fully paid
create or replace function public.documents_sync_paid() returns trigger
language plpgsql set search_path = public as $$
begin
  -- Estimate converted to Bill: carry over the money already received
  if TG_OP = 'INSERT' and NEW.converted_from is not null and NEW.paid_amount = 0 then
    select paid_amount into NEW.paid_amount from public.documents where id = NEW.converted_from;
    NEW.paid_amount := coalesce(NEW.paid_amount, 0);
  end if;
  if NEW.payment_status = 'paid' and NEW.paid_amount < NEW.total then
    NEW.paid_amount := NEW.total;
  end if;
  return NEW;
end $$;
drop trigger if exists documents_sync_paid on public.documents;
create trigger documents_sync_paid before insert or update on public.documents
  for each row execute function public.documents_sync_paid();

-- 2) Every money-in entry is kept (who paid, how, when)
create table if not exists public.document_payments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  amount int not null check (amount > 0),
  method text not null check (method in ('cash','upi')),
  paid_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists document_payments_doc_idx on public.document_payments(document_id);
alter table public.document_payments enable row level security;
drop policy if exists admin_all on public.document_payments;
create policy admin_all on public.document_payments
  for all using (public.is_admin()) with check (public.is_admin());

-- 3) Admin: record a payment (full or part)
create or replace function public.admin_add_payment(
  p_document_id uuid, p_amount int, p_method text, p_note text default null
) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_doc record;
  v_paid int;
begin
  if not public.is_admin() then return json_build_object('error','unauthorized'); end if;
  select * into v_doc from public.documents where id = p_document_id for update;
  if not found then return json_build_object('error','not_found'); end if;
  if v_doc.status = 'cancelled' then return json_build_object('error','cancelled'); end if;
  if v_doc.doc_type not in ('estimate','bill') then return json_build_object('error','not_a_sale'); end if;
  if exists (select 1 from public.documents where converted_from = p_document_id and status <> 'cancelled') then
    return json_build_object('error','converted');  -- record the payment on the new bill instead
  end if;
  if p_amount is null or p_amount <= 0 then return json_build_object('error','bad_amount'); end if;
  if p_amount > v_doc.total - v_doc.paid_amount then
    return json_build_object('error','more_than_balance','balance', v_doc.total - v_doc.paid_amount);
  end if;
  if p_method not in ('cash','upi') then return json_build_object('error','bad_method'); end if;

  insert into public.document_payments (document_id, amount, method, note)
  values (p_document_id, p_amount, p_method, nullif(trim(coalesce(p_note,'')),''));

  v_paid := v_doc.paid_amount + p_amount;
  update public.documents
     set paid_amount = v_paid,
         payment_status = case when v_paid >= total then 'paid' else 'partial' end
   where id = p_document_id;

  -- The linked sale in orders becomes 'paid' only when fully paid
  if v_paid >= v_doc.total and v_doc.order_id is not null then
    update public.orders set payment_status = 'paid' where id = v_doc.order_id;
  end if;

  return json_build_object('status','ok','paid_amount',v_paid,
                           'balance', greatest(v_doc.total - v_paid, 0));
end $$;
revoke all on function public.admin_add_payment(uuid,int,text,text) from public, anon;
grant execute on function public.admin_add_payment(uuid,int,text,text) to authenticated;

-- 4) Public document page also gets paid amount + balance
create or replace function public.get_document(p_no text, p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_doc record;
  v_party public.parties%rowtype;  -- rowtype (not record): walk-in docs have no party and must not crash
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
    'paid_amount', v_doc.paid_amount,
    'balance', greatest(v_doc.total - v_doc.paid_amount, 0),
    'payment_method', v_doc.payment_method,
    'payment_status', v_doc.payment_status,
    'due_date', v_doc.due_date,
    'notes', v_doc.notes,
    'doc_status', v_doc.status,
    'cancel_reason', v_doc.cancel_reason,
    'party', case when v_party.id is not null then jsonb_build_object(
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
revoke all on function public.get_document(text,text) from public;
grant execute on function public.get_document(text,text) to anon, authenticated;

-- Check: must show paid_amount column = 1 row
select column_name from information_schema.columns
where table_schema='public' and table_name='documents' and column_name='paid_amount';
