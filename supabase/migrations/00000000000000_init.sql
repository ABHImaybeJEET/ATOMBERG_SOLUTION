-- GoalTrack Database Schema, RLS, and Seed Data

-- 1. Tables

CREATE TYPE user_role AS ENUM ('employee', 'manager', 'admin');
CREATE TYPE cycle_phase AS ENUM ('goal_setting', 'q1', 'q2', 'q3', 'q4');
CREATE TYPE sheet_status AS ENUM ('draft', 'submitted', 'approved', 'returned');
CREATE TYPE uom_type AS ENUM ('min_numeric', 'max_numeric', 'timeline', 'zero');
CREATE TYPE achievement_status AS ENUM ('not_started', 'on_track', 'completed');
CREATE TYPE quarter_enum AS ENUM ('q1', 'q2', 'q3', 'q4', 'annual');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department TEXT,
    manager_id UUID REFERENCES profiles(id)
);

CREATE TABLE goal_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phase cycle_phase NOT NULL DEFAULT 'goal_setting',
    opens_on DATE NOT NULL,
    closes_on DATE NOT NULL,
    is_active BOOLEAN DEFAULT false
);

CREATE TABLE goal_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES profiles(id),
    cycle_id UUID NOT NULL REFERENCES goal_cycles(id),
    status sheet_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    manager_id UUID REFERENCES profiles(id),
    UNIQUE(employee_id, cycle_id)
);

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_id UUID NOT NULL REFERENCES goal_sheets(id) ON DELETE CASCADE,
    thrust_area TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    uom_type uom_type NOT NULL,
    target_value NUMERIC,
    target_date DATE,
    weightage NUMERIC NOT NULL CHECK (weightage >= 10),
    is_shared BOOLEAN DEFAULT false,
    shared_from_goal_id UUID REFERENCES goals(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    quarter quarter_enum NOT NULL,
    actual_value NUMERIC,
    completion_date DATE,
    status achievement_status NOT NULL DEFAULT 'not_started',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(goal_id, quarter)
);

CREATE TABLE checkin_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES profiles(id),
    quarter quarter_enum NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    change_type TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_type TEXT NOT NULL,
    threshold_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 2. Row Level Security (RLS)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read profiles. Users can update their own. Admins can update all.
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Goal Cycles: Everyone can read. Admins can manage.
CREATE POLICY "Cycles viewable by everyone" ON goal_cycles FOR SELECT USING (true);
CREATE POLICY "Admins manage cycles" ON goal_cycles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Goal Sheets: Employees see own, Managers see reports, Admins see all
CREATE POLICY "Sheets visibility" ON goal_sheets FOR SELECT USING (
    employee_id = auth.uid() OR
    manager_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Employees create/update own sheets" ON goal_sheets FOR ALL USING (
    employee_id = auth.uid()
);
CREATE POLICY "Managers update reports sheets" ON goal_sheets FOR UPDATE USING (
    manager_id = auth.uid()
);

-- Goals: Same as Goal Sheets visibility
CREATE POLICY "Goals visibility" ON goals FOR SELECT USING (
    EXISTS (SELECT 1 FROM goal_sheets s WHERE s.id = goals.sheet_id AND (
        s.employee_id = auth.uid() OR s.manager_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    ))
);
CREATE POLICY "Manage goals" ON goals FOR ALL USING (
    EXISTS (SELECT 1 FROM goal_sheets s WHERE s.id = goals.sheet_id AND (
        s.employee_id = auth.uid() OR s.manager_id = auth.uid()
    ))
);

-- Achievements: Same
CREATE POLICY "Achievements visibility" ON achievements FOR SELECT USING (
    EXISTS (SELECT 1 FROM goals g JOIN goal_sheets s ON g.sheet_id = s.id WHERE g.id = achievements.goal_id AND (
        s.employee_id = auth.uid() OR s.manager_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    ))
);
CREATE POLICY "Employees update achievements" ON achievements FOR ALL USING (
    EXISTS (SELECT 1 FROM goals g JOIN goal_sheets s ON g.sheet_id = s.id WHERE g.id = achievements.goal_id AND s.employee_id = auth.uid())
);

-- Checkin Comments: Same
CREATE POLICY "Comments visibility" ON checkin_comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM goals g JOIN goal_sheets s ON g.sheet_id = s.id WHERE g.id = checkin_comments.goal_id AND (
        s.employee_id = auth.uid() OR s.manager_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    ))
);
CREATE POLICY "Managers create comments" ON checkin_comments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM goals g JOIN goal_sheets s ON g.sheet_id = s.id WHERE g.id = checkin_comments.goal_id AND s.manager_id = auth.uid())
);


-- 3. Trigger for Audit Logs
CREATE OR REPLACE FUNCTION log_goal_changes() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (OLD.target_value IS DISTINCT FROM NEW.target_value OR OLD.weightage IS DISTINCT FROM NEW.weightage OR OLD.title IS DISTINCT FROM NEW.title) THEN
        INSERT INTO audit_logs (entity_type, entity_id, changed_by, change_type, old_value, new_value)
        VALUES ('goal', NEW.id, auth.uid(), 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_goal_changes
    AFTER UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION log_goal_changes();

