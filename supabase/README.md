# BROSKI Supabase Database Notes

This directory contains the database schema and patch files for the BROSKI D2C platform (Order System V2).

## Files

1. `order_system_v2.sql`:
   - Base migration script for Order System V2.
   - Sets up `settings`, `orders`, `sample_claims`, `waitlist`, `parties`, `documents`, and `doc_counters`.
   - Defines all public and admin RPC functions with row locks, sequential FY document counters, and RLS policies.
   - Safe and idempotent to run multiple times.

2. `order_system_v2_patch.sql`:
   - Post-v2 patch applied on 23 Nov 2026.
   - 1) Sets `place_order` search path to `public, extensions` for pgcrypto gen_random_bytes access.
   - 2) Moves auto-bill creation for orders ≥ ₹200 to an `AFTER UPDATE` trigger (`on_order_after_update`), resolving the "tuple already modified" lock error.
   - 3) Defines `admin_close_day(p_date)` security definer function for closing daily accounts and generating consolidated bills.
   - 4) Revokes public access to internal sequence/billing functions (`current_fy`, `clean_address_key`, `next_doc_no`, `next_order_public_no`, `issue_bill_for_order`, `issue_daily_consolidated`).
