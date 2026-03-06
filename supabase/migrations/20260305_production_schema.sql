-- Migration: 0000_production_schema.sql
-- Description: Core schema for CloudScale Genius (Users, Analyses, Policies, Savings, Audit)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS (Clerk Sync syncs directly via webhook to this table)
create table public.users (
  id text primary key, -- Clerk User ID (e.g., user_2Npe...)
  email text not null unique,
  first_name text,
  last_name text,
  image_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 2. ANALYSES (CSV results)
create table public.analyses (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.users(id) on delete cascade not null,
  file_name text not null,
  provider text not null, -- aws, gcp, azure, k8s
  status text not null default 'completed',
  original_cost numeric(10, 2) not null,
  optimized_cost numeric(10, 2) not null,
  savings_percentage numeric(5, 2) not null,
  confidence_score numeric(5, 2) not null,
  created_at timestamp with time zone default now() not null
);

-- 3. POLICIES (YAML configs)
create table public.policies (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.users(id) on delete cascade not null,
  analysis_id uuid references public.analyses(id) on delete cascade not null,
  name text not null,
  yaml_content text not null,
  deployed boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 4. SAVINGS HISTORY (ROI tracking)
create table public.savings_history (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.users(id) on delete cascade not null,
  month date not null, -- stored as date, usually first of month
  saved_amount numeric(10, 2) not null,
  created_at timestamp with time zone default now() not null,
  unique (user_id, month)
);

-- 5. AUDIT LOGS (Compliance)
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id text references public.users(id) on delete set null,
  action text not null,
  entity_type text not null, -- e.g., 'analysis', 'policy', 'auth', 'system'
  entity_id text,
  ip_address text,
  created_at timestamp with time zone default now() not null
);

-- RLS Settings
-- Clerk specific setup: Create a function to extract the clerk ID from the auth.jwt()
create or replace function requesting_user_id() returns text as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ language sql stable;

alter table public.users enable row level security;
alter table public.analyses enable row level security;
alter table public.policies enable row level security;
alter table public.savings_history enable row level security;
alter table public.audit_logs enable row level security;

-- USERS Policies
create policy "Users can read their own profile" on public.users for select using (requesting_user_id() = id);

-- ANALYSES Policies
create policy "Users can view own analyses" on public.analyses for select using (requesting_user_id() = user_id);
create policy "Users can create own analyses" on public.analyses for insert with check (requesting_user_id() = user_id);
create policy "Users can delete own analyses" on public.analyses for delete using (requesting_user_id() = user_id);

-- POLICIES Policies
create policy "Users can view own policies" on public.policies for select using (requesting_user_id() = user_id);
create policy "Users can create own policies" on public.policies for insert with check (requesting_user_id() = user_id);
create policy "Users can update own policies" on public.policies for update using (requesting_user_id() = user_id);
create policy "Users can delete own policies" on public.policies for delete using (requesting_user_id() = user_id);

-- SAVINGS HISTORY Policies
create policy "Users can view own savings history" on public.savings_history for select using (requesting_user_id() = user_id);

-- AUDIT LOGS Policies
create policy "Users can view own audit logs" on public.audit_logs for select using (requesting_user_id() = user_id);
create policy "System can create audit logs" on public.audit_logs for insert with check (true);

-- Real-time Subscriptions (For Dashboard Websockets)
-- Drop publication if it exists (handles re-running migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

alter publication supabase_realtime add table public.analyses;
alter publication supabase_realtime add table public.savings_history;
alter publication supabase_realtime add table public.audit_logs;

-- Indexes for scale and performance
create index idx_analyses_user_comp on public.analyses(user_id, created_at desc);
create index idx_policies_user on public.policies(user_id);
create index idx_savings_user on public.savings_history(user_id, month);
create index idx_audit_user_time on public.audit_logs(user_id, created_at desc);
