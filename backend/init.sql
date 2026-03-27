-- Performance Management System (PMS) Schema

-- Enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS goal_status CASCADE;
DROP TYPE IF EXISTS cycle_type CASCADE;
DROP TYPE IF EXISTS review_cycle_status CASCADE;
DROP TYPE IF EXISTS form_type CASCADE;
DROP TYPE IF EXISTS flag_status CASCADE;
DROP TYPE IF EXISTS related_entity_type CASCADE;
DROP TYPE IF EXISTS form_type CASCADE;

-- Tables
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS feedback_submissions CASCADE;
DROP TABLE IF EXISTS probation_triggers CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS review_cycles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin');
CREATE TYPE goal_status AS ENUM ('draft', 'pending approval', 'active', 'completed', 'archived');
CREATE TYPE cycle_type AS ENUM ('biannual', 'quarterly', 'both');
CREATE TYPE review_cycle_status AS ENUM ('open', 'closed', 'finalized');
CREATE TYPE form_type AS ENUM ('self', 'manager');
CREATE TYPE flag_status AS ENUM ('none', 'soft', 'hard', 'repeat');
CREATE TYPE related_entity_type AS ENUM ('goal', 'probation', 'review');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    manager_id UUID REFERENCES users(id),
    doj DATE NOT NULL DEFAULT CURRENT_DATE,
    probation_period INTEGER[] DEFAULT '{30, 60, 80}',
    leave_adjusted_trigger_date DATE,
    is_player_coach BOOLEAN DEFAULT FALSE,
    cycle_type cycle_type DEFAULT 'biannual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Cycles Table
CREATE TABLE review_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- biannual, quarterly
    period_label TEXT NOT NULL,
    start_date DATE NOT NULL,
    close_date DATE NOT NULL,
    finalize_date DATE NOT NULL,
    status review_cycle_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals Table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    status goal_status DEFAULT 'draft',
    weightage NUMERIC(5,2) DEFAULT 0,
    completion_pct NUMERIC(5,2) DEFAULT 0,
    cycle_id UUID REFERENCES review_cycles(id),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Probation Triggers Table
CREATE TABLE probation_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id),
    trigger_day INTEGER NOT NULL, -- 30, 60, 80
    scheduled_date DATE NOT NULL,
    leave_adjusted_date DATE,
    sent_at TIMESTAMPTZ,
    employee_submitted_at TIMESTAMPTZ,
    manager_submitted_at TIMESTAMPTZ,
    shared_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,
    waived BOOLEAN DEFAULT FALSE,
    waived_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback Submissions Table (Unified response store)
CREATE TABLE feedback_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    form_type form_type NOT NULL,
    cycle_id UUID REFERENCES review_cycles(id),
    probation_trigger_id UUID REFERENCES probation_triggers(id),
    goal_ratings JSONB, -- { "goal_id": rating }
    open_text JSONB, -- { "what_went_well": "...", ... }
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    flag_status flag_status DEFAULT 'none',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    shared_at TIMESTAMPTZ
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    escalation_level INTEGER DEFAULT 0,
    related_entity_id UUID,
    related_entity_type related_entity_type
);

-- Audit Log Table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    performed_by UUID REFERENCES users(id),
    target_entity TEXT,
    target_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE probation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Will be refined later)
-- Employees see their own data
CREATE POLICY "Users read own data" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Managers read reportees" ON users FOR SELECT USING (manager_id = auth.uid());
CREATE POLICY "Admins read all" ON users FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Goals own access" ON goals FOR ALL USING (employee_id = auth.uid());
CREATE POLICY "Managers goal access" ON goals FOR ALL USING (employee_id IN (SELECT id FROM users WHERE manager_id = auth.uid()));

-- Functions and Triggers for business logic
-- (e.g., auto-tagging red flags, cascading goals)
-- These will be implemented in the backend logic for better control, 
-- but database-level constraints are solid here.
