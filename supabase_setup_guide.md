# 🗄️ Supabase Setup Guide for GoalTrack

Follow these steps to configure your Supabase backend for the GoalTrack Enterprise Portal.

## 1. Create a New Project
1. Go to [database.new](https://database.new) and create a new project.
2. Note your **Project URL** and **Anon Key** from the Settings -> API section.

## 2. Initialize the Database
Run the following SQL in the Supabase **SQL Editor** to create the necessary tables and relationships:

```sql
-- Profiles table for user metadata
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'manager', 'employee')) DEFAULT 'employee',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Goal Sheets table
CREATE TABLE goal_sheets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  cycle_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'returned')) DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  manager_id UUID REFERENCES auth.users,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Goals table
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sheet_id UUID REFERENCES goal_sheets ON DELETE CASCADE NOT NULL,
  thrust_area TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  uom TEXT NOT NULL,
  target TEXT NOT NULL,
  weightage INTEGER NOT NULL,
  achievement TEXT,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  change_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

## 3. Environment Configuration
Update your `.env` file in the `goaltrack` directory:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Authentication Setup
1. Enable **Email/Password** authentication in the Supabase Dashboard.
2. (Optional) Disable "Confirm Email" for faster testing during development.
