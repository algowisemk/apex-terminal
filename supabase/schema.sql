-- ==============================================================================
-- APEX TERMINAL - SUPABASE DATABASE SCHEMA & POLICIES
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/shwnxbgwsmsqpieqxkml/sql
-- ==============================================================================

-- 1. PROFILES TABLE (Stores user settings, default theme, layout)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  default_workspace JSONB DEFAULT '{"theme": "dark", "layout": "grid"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BROKER CREDENTIALS TABLE (Stores encrypted BYOK keys with Row Level Security)
CREATE TABLE IF NOT EXISTS public.broker_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  broker TEXT NOT NULL CHECK (broker IN ('ALPACA', 'DERIBIT', 'DELTA')),
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  is_paper BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, broker)
);

-- 3. WATCHLISTS TABLE (Custom cloud-synced multi-asset watchlists)
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Main Watchlist',
  symbols TEXT[] NOT NULL DEFAULT ARRAY['BTCUSD', 'ETHUSD', 'NVDA', 'SPY', 'AAPL'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRADE JOURNAL TABLE (Order execution logs & PnL history)
CREATE TABLE IF NOT EXISTS public.trade_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  broker TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  qty NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  realized_pnl NUMERIC DEFAULT 0,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_journal ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES (Users can only read and write their OWN data)
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own broker credentials" 
  ON public.broker_credentials FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own broker credentials" 
  ON public.broker_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own broker credentials" 
  ON public.broker_credentials FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own broker credentials" 
  ON public.broker_credentials FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own watchlists" 
  ON public.watchlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlists" 
  ON public.watchlists FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own trades" 
  ON public.trade_journal FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can record own trades" 
  ON public.trade_journal FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. AUTOMATIC USER PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
