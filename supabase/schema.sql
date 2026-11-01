-- Academia Examen EUNACOM — accounts, purchases and study progress.
-- Run once in the new Supabase project: Dashboard → SQL Editor → paste → Run.
--
-- Purchases are keyed by the buyer's EMAIL (from the checkout form / PayPal payer), not by user id, so someone
-- can pay first and create the account afterwards: whatever was bought with that email shows up as soon as they
-- sign up with it. Only the server (service role) writes purchases; users can only read their own.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  country text,            -- 'CL' or ISO code of where they graduated / live
  city text,
  university text,         -- key from src/data/universities.js
  exam_date text,          -- e.g. '2026-12' (convocatoria they're aiming for)
  heard_from text,         -- how they found us
  xp integer not null default 0,
  streak_days integer not null default 0,
  last_active date,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id bigint generated always as identity primary key,
  email text not null,                  -- lower-cased buyer email
  sku text not null,                    -- product SKU from src/data/tienda.js (packs are expanded client-side)
  amount_clp integer,
  provider text not null,               -- 'paypal' | 'mercadopago' | 'webpay' | 'transfer' | 'manual'
  provider_ref text,                    -- PayPal capture id, MP payment id…
  status text not null default 'paid',  -- 'paid' | 'refunded'
  buyer_name text,
  created_at timestamptz not null default now()
);
create index if not exists purchases_email_idx on public.purchases (lower(email));
create unique index if not exists purchases_ref_sku_idx on public.purchases (provider, provider_ref, sku);

-- Checkout orders (server-only). One row per checkout; on payment it becomes one purchases row per SKU.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
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
alter table public.orders enable row level security;  -- no policies: only the service role touches it

-- XP ledger (one row per action; profiles.xp is the running total)
create table if not exists public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,          -- 'question_correct' | 'question_answered' | 'class_watched' | 'exam_finished' | 'streak'
  ref text,                    -- question id, class id…
  points integer not null,
  created_at timestamptz not null default now()
);

-- Question bank progress (spaced review): one row per user × question
create table if not exists public.question_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  attempts integer not null default 0,
  correct integer not null default 0,
  last_answer text,
  box smallint not null default 0,
  due date,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- Class progress (Aula)
create table if not exists public.class_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id text not null,
  position_s integer not null default 0,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, class_id)
);

-- ── Row level security ───────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.xp_events enable row level security;
alter table public.question_progress enable row level security;
alter table public.class_progress enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- A user sees the purchases made with their (verified) account email.
drop policy if exists "own purchases read" on public.purchases;
create policy "own purchases read" on public.purchases for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "own xp read" on public.xp_events;
create policy "own xp read" on public.xp_events for select using (auth.uid() = user_id);

drop policy if exists "own question progress" on public.question_progress;
create policy "own question progress" on public.question_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own class progress" on public.class_progress;
create policy "own class progress" on public.class_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── New user → profile row ───────────────────────────────────────────────────
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ── XP: award points server-side so users can't edit their own total ─────────
create or replace function public.award_xp(p_kind text, p_ref text, p_points integer) returns integer
language plpgsql security definer set search_path = public as $$
declare total integer;
begin
  if auth.uid() is null or p_points < 0 or p_points > 200 then raise exception 'not allowed'; end if;
  insert into xp_events (user_id, kind, ref, points) values (auth.uid(), p_kind, p_ref, p_points);
  update profiles set xp = xp + p_points,
    streak_days = case when last_active = current_date then streak_days
                       when last_active = current_date - 1 then streak_days + 1 else 1 end,
    last_active = current_date
  where id = auth.uid() returning xp into total;
  return total;
end $$;
grant execute on function public.award_xp(text, text, integer) to authenticated;

-- Users may edit their own profile fields, but never xp / streak (those only change through award_xp).
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone, country, city, university, exam_date, heard_from, onboarded) on public.profiles to authenticated;

-- IMPORTANT (Dashboard → Authentication → Providers → Email): keep "Confirm email" ON.
-- Purchases are matched by email, so only a verified owner of that inbox may see them.
