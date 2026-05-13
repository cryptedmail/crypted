create table if not exists public.profiles (
  email text primary key,
  wallet_address text,
  wallet_linked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  email text primary key references public.profiles(email) on delete cascade,
  status text not null default 'free',
  tier_id text,
  tier_name text,
  network text,
  tx_hash text,
  explorer_url text,
  membership_token text,
  premium_until timestamptz,
  verified_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.processed_transactions (
  tx_hash text primary key,
  email text not null references public.profiles(email) on delete cascade,
  wallet_address text not null,
  tier_id text not null,
  amount_usdc text,
  network text not null,
  status text not null default 'verified',
  verified_at timestamptz not null default now()
);

create table if not exists public.pending_payments (
  tx_hash text primary key,
  email text not null references public.profiles(email) on delete cascade,
  wallet_address text not null,
  tier_id text not null,
  network text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.processed_transactions enable row level security;
alter table public.pending_payments enable row level security;

create policy if not exists "Users can read their profile"
  on public.profiles for select
  using (auth.jwt() ->> 'email' = email);

create policy if not exists "Users can read their subscription"
  on public.subscriptions for select
  using (auth.jwt() ->> 'email' = email);

-- Writes are performed by the backend only with SUPABASE_SERVICE_ROLE_KEY.
