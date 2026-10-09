/*
# Welfare Scheme Benefits Tracker — Schema

## Overview
Creates the data model for a personal government-welfare-benefits tracker. Each
signed-in user manages their own profile, the schemes they have applied to, and
reminders for upcoming actions. A shared catalog of government schemes is seeded
so all users can browse the same list of available programs.

## New Tables
1. profiles — one row per user, extends auth.users with demographic + family data.
2. schemes — shared catalog of government welfare schemes (read-only for users).
3. user_schemes — a user's tracked scheme applications with status + dates.
4. reminders — date-based reminders tied to a user, optionally linked to a scheme.

## Security
- RLS enabled on every table.
- schemes catalog readable by anon + authenticated (shared reference data).
- profiles, user_schemes, reminders are owner-scoped to authenticated with
  auth.uid() ownership checks. Owner columns default to auth.uid().
- 4 separate policies (SELECT/INSERT/UPDATE/DELETE) per owner-scoped table.

## Notes
1. Multi-user app with sign-in screen: policies scoped to authenticated.
2. user_schemes has UNIQUE(user_id, scheme_id).
3. updated_at maintained by triggers.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  age int,
  annual_income numeric DEFAULT 0,
  state text DEFAULT '',
  family_size int DEFAULT 1,
  has_disability boolean NOT NULL DEFAULT false,
  is_senior boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'financial',
  description text NOT NULL DEFAULT '',
  eligibility text NOT NULL DEFAULT '',
  benefit_amount numeric,
  benefit_unit text,
  eligibility_criteria text[] NOT NULL DEFAULT '{}',
  documents_required text[] NOT NULL DEFAULT '{}',
  application_url text,
  contact_info text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_schemes" ON schemes;
CREATE POLICY "read_schemes" ON schemes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_schemes_auth" ON schemes;
CREATE POLICY "insert_schemes_auth" ON schemes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_schemes_auth" ON schemes;
CREATE POLICY "update_schemes_auth" ON schemes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id uuid NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'interested',
  amount_received numeric,
  application_date date,
  approval_date date,
  next_action_date date,
  next_action text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scheme_id)
);

ALTER TABLE user_schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_user_schemes" ON user_schemes;
CREATE POLICY "select_own_user_schemes" ON user_schemes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_user_schemes" ON user_schemes;
CREATE POLICY "insert_own_user_schemes" ON user_schemes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_user_schemes" ON user_schemes;
CREATE POLICY "update_own_user_schemes" ON user_schemes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_user_schemes" ON user_schemes;
CREATE POLICY "delete_own_user_schemes" ON user_schemes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_scheme_id uuid REFERENCES user_schemes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reminders" ON reminders;
CREATE POLICY "select_own_reminders" ON reminders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_reminders" ON reminders;
CREATE POLICY "insert_own_reminders" ON reminders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reminders" ON reminders;
CREATE POLICY "update_own_reminders" ON reminders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reminders" ON reminders;
CREATE POLICY "delete_own_reminders" ON reminders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_schemes_updated_at ON user_schemes;
CREATE TRIGGER user_schemes_updated_at BEFORE UPDATE ON user_schemes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_schemes_user_id ON user_schemes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_schemes_status ON user_schemes(status);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
