-- UniScale AI Production Schema
-- Designed for Clerk Auth Sync & Row Level Security (RLS)

-- 1. USERS (Synced via Clerk Webhook)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'Free' CHECK (role IN ('Free', 'Pro', 'Team')),
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ANALYSES (CSV Upload Results)
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    provider TEXT NOT NULL,
    region TEXT,
    original_cost DECIMAL(12, 2) NOT NULL,
    optimized_cost DECIMAL(12, 2) NOT NULL,
    savings_percentage DECIMAL(5, 2) NOT NULL,
    raw_results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. POLICIES (YAML Configs & Feature Toggles)
CREATE TABLE IF NOT EXISTS public.policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    yaml_config TEXT NOT NULL,
    auto_deploy BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SAVINGS HISTORY (ROI Tracking for Dashboard)
CREATE TABLE IF NOT EXISTS public.savings_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.users(clerk_id) ON DELETE CASCADE,
    daily_savings DECIMAL(12, 2) NOT NULL,
    waste_percentage DECIMAL(5, 2) NOT NULL,
    live_compute_pulse DECIMAL(5,2),
    timestamp DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE(user_id, timestamp)
);

-- 5. AUDIT LOGS (Compliance & Security)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.users(clerk_id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- === ENABLE ROW LEVEL SECURITY (RLS) ===
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- === RLS POLICIES (Multi-tenant isolation) ===

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT 
USING (auth.uid()::text = clerk_id);

-- Analyses isolation
CREATE POLICY "Users can manage own analyses" 
ON public.analyses FOR ALL 
USING (auth.uid()::text = user_id);

-- Policies isolation
CREATE POLICY "Users can manage own policies" 
ON public.policies FOR ALL 
USING (auth.uid()::text = user_id);

-- Savings history isolation
CREATE POLICY "Users can view own savings" 
ON public.savings_history FOR SELECT 
USING (auth.uid()::text = user_id);

-- Audit logs (Read only for users)
CREATE POLICY "Users can view own audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid()::text = user_id);

-- === REAL-TIME SUBSCRIPTIONS ===
-- Enable replication for specific tables to push live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analyses;
