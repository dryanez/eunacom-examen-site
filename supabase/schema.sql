-- Academia Examen EUNACOM — accounts, purchases and study progress.
-- Stored in the EUNACOM app's Supabase project (Examenes-Eunacom, zmqwpkettikjutgzquri) only because the free plan
-- has no room for another project. The site has its OWN accounts (aee_users), separate from the EUNACOM app's users
-- (auth.users): no Supabase Auth, no link to auth.users, and nothing of the EUNACOM app is touched (its
-- public.profiles, its handle_new_user trigger and its other tables stay as they are). Everything is prefixed aee_.
--
-- Only the site's server (api/*.js, service role) reads or writes these tables: RLS is on with no policies, and
-- anon / authenticated (the EUNACOM app's roles) get no grants at all.
-- Run (idempotent): npx supabase db query --remote=zmqwpkettikjutgzquri --yes -f supabase/schema.sql
--
-- Purchases are keyed by the buyer's EMAIL, not by account, so someone can pay first and create the account
-- afterwards: whatever was bought with that email shows up once they sign up and confirm that email.

-- 2026-11-04: first version hung profiles off auth.users (shared EUNACOM accounts); Felipe wants them separate.
-- Those tables were empty; drop them once so they are recreated against aee_users.
drop policy if exists "aee own purchases read" on public.aee_purchases;
drop function if exists public.aee_ensure_profile();
drop function if exists public.aee_award_xp(text, text, integer);
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'aee_profiles_id_fkey' and confrelid = 'auth.users'::regclass) then
    drop table if exists public.aee_xp_events, public.aee_question_progress, public.aee_class_progress, public.aee_profiles;
  end if;
end $$;

create table if not exists public.aee_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text,                   -- scrypt (api/_auth.js); null for Google / Apple-only accounts
  email_verified_at timestamptz,        -- purchases only show once the inbox is confirmed
  created_at timestamptz not null default now(),
  last_sign_in_at timestamptz
);
create unique index if not exists aee_users_email_idx on public.aee_users (lower(email));

-- Sessions and one-time links (confirm email, reset password). Only the SHA-256 of each token is stored.
create table if not exists public.aee_tokens (
  token_hash text primary key,
  user_id uuid not null references public.aee_users(id) on delete cascade,
  kind text not null,                   -- 'session' | 'verify' | 'reset' | 'activate' | 'login'
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists aee_tokens_user_idx on public.aee_tokens (user_id, kind);
-- 'activate' links go out in the purchase email before any account exists: they carry the buyer's email instead.
-- 'login' is the 5-minute hand-off after Google / Apple sign-in.
alter table public.aee_tokens alter column user_id drop not null;
alter table public.aee_tokens add column if not exists email text;
alter table public.aee_users add column if not exists google_sub text;
alter table public.aee_users add column if not exists apple_sub text;
alter table public.aee_users alter column password_hash drop not null;  -- Google / Apple-only accounts

create table if not exists public.aee_profiles (
  id uuid primary key references public.aee_users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  country text,            -- 'CL' or ISO code of where they graduated / live
  city text,
  university text,         -- key from src/data/universities.js
  exam_date text,          -- e.g. 'Diciembre 2026' (convocatoria they're aiming for)
  heard_from text,         -- how they found us
  xp integer not null default 0,
  streak_days integer not null default 0,
  last_active date,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.aee_purchases (
  id bigint generated always as identity primary key,
  email text not null,                  -- lower-cased buyer email
  sku text not null,                    -- product SKU from api/_catalog.json (packs are expanded by the server)
  amount_clp integer,
  provider text not null,               -- 'paypal' | 'mercadopago' | 'webpay' | 'transfer' | 'manual'
  provider_ref text,                    -- PayPal capture id, MP payment id…
  status text not null default 'paid',  -- 'paid' | 'refunded'
  buyer_name text,
  created_at timestamptz not null default now()
);
create index if not exists aee_purchases_email_idx on public.aee_purchases (lower(email));
create unique index if not exists aee_purchases_ref_sku_idx on public.aee_purchases (provider, provider_ref, sku);

-- Checkout orders. One row per checkout; on payment it becomes one aee_purchases row per SKU.
create table if not exists public.aee_orders (
  id uuid primary key default gen_random_uuid(),
  email text not null default '',
  buyer_name text,
  phone text,
  skus text[] not null,
  amount_clp integer not null,
  amount_usd numeric(10,2),
  provider text not null,
  provider_ref text,
  payer_email text,               -- email PayPal / Mercado Pago report for the payer
  status text not null default 'pending',  -- 'pending' | 'paid' | 'cancelled'
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists aee_orders_provider_ref_idx on public.aee_orders (provider_ref);

-- XP ledger (one row per action; aee_profiles.xp is the running total)
create table if not exists public.aee_xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.aee_users(id) on delete cascade,
  kind text not null,          -- 'onboarding' | 'question_correct' | 'class_watched' | 'exam_finished' | 'streak'
  ref text,
  points integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.aee_question_progress (
  user_id uuid not null references public.aee_users(id) on delete cascade,
  question_id text not null,
  attempts integer not null default 0,
  correct integer not null default 0,
  last_answer text,
  box smallint not null default 0,
  due date,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.aee_class_progress (
  user_id uuid not null references public.aee_users(id) on delete cascade,
  class_id text not null,
  position_s integer not null default 0,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, class_id)
);

-- XP in one statement so concurrent awards can't lose points.
create or replace function public.aee_award_xp(p_user uuid, p_kind text, p_ref text, p_points integer) returns integer
language plpgsql set search_path = public as $$
declare total integer;
begin
  insert into aee_xp_events (user_id, kind, ref, points) values (p_user, p_kind, p_ref, p_points);
  update aee_profiles set xp = xp + p_points,
    streak_days = case when last_active = current_date then streak_days
                       when last_active = current_date - 1 then streak_days + 1 else 1 end,
    last_active = current_date
  where id = p_user returning xp into total;
  return total;
end $$;

-- ── Lock everything to the server ────────────────────────────────────────────
do $$ declare t text; begin
  foreach t in array array['aee_users','aee_tokens','aee_profiles','aee_purchases','aee_orders','aee_xp_events','aee_question_progress','aee_class_progress'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
revoke execute on function public.aee_award_xp(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.aee_award_xp(uuid, text, text, integer) to service_role;
