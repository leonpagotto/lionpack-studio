/**
 * LionPack Studio - Initial Database Schema
 * PostgreSQL with Supabase
 *
 * This migration creates the complete database schema for LionPack Studio,
 * including all tables, relationships, indexes, and Row-Level Security (RLS) policies.
 *
 * Tables:
 * - profiles: User profiles and settings
 * - teams: Team management and collaboration
 * - packs: LionPacks (templates, processes, workflows)
 * - projects: User projects using LionPacks
 * - workflows: Workflow definitions and instances
 * - specifications: Project specifications with AI integration
 * - workflow_steps: Steps within workflows
 * - team_members: Team membership and roles
 * - audit_logs: Activity and change tracking
 *
 * Security: All tables have RLS policies to ensure user data isolation
 */

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

-- User roles for authorization
CREATE TYPE user_role AS ENUM (
  'admin',
  'owner',
  'editor',
  'viewer',
  'member'
);

-- Workflow status
CREATE TYPE workflow_status AS ENUM (
  'draft',
  'active',
  'paused',
  'completed',
  'archived'
);

-- Specification status
CREATE TYPE spec_status AS ENUM (
  'draft',
  'generated',
  'refined',
  'approved',
  'implemented',
  'archived'
);

-- Audit action types
CREATE TYPE audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'archive',
  'restore',
  'share',
  'unshare'
);

-- ============================================================================
-- PROFILES TABLE (User profiles and settings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  organization TEXT,
  role user_role DEFAULT 'member' NOT NULL,
  settings JSONB DEFAULT '{}'::JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Add trigger to update updated_at on profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Create index for common queries
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_organization_idx ON profiles(organization);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at DESC);

-- ============================================================================
-- TEAMS TABLE (Team management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}'::JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TRIGGER teams_updated_at_trigger
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

CREATE INDEX IF NOT EXISTS teams_owner_id_idx ON teams(owner_id);
CREATE INDEX IF NOT EXISTS teams_slug_idx ON teams(slug);
CREATE INDEX IF NOT EXISTS teams_created_at_idx ON teams(created_at DESC);

-- ============================================================================
-- TEAM_MEMBERS TABLE (Team membership)
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_role_idx ON team_members(role);

-- ============================================================================
-- PACKS TABLE (LionPacks - templates, processes, workflows)
-- ============================================================================

CREATE TABLE IF NOT EXISTS packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0' NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  template_data JSONB,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  is_template BOOLEAN DEFAULT TRUE NOT NULL,
  download_count INTEGER DEFAULT 0 NOT NULL,
  rating DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(owner_id, slug)
);

CREATE TRIGGER packs_updated_at_trigger
BEFORE UPDATE ON packs
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

CREATE INDEX IF NOT EXISTS packs_owner_id_idx ON packs(owner_id);
CREATE INDEX IF NOT EXISTS packs_team_id_idx ON packs(team_id);
CREATE INDEX IF NOT EXISTS packs_slug_idx ON packs(slug);
CREATE INDEX IF NOT EXISTS packs_category_idx ON packs(category);
CREATE INDEX IF NOT EXISTS packs_tags_idx ON packs USING gin(tags);
CREATE INDEX IF NOT EXISTS packs_created_at_idx ON packs(created_at DESC);

-- ============================================================================
-- PROJECTS TABLE (User projects using LionPacks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  pack_id UUID REFERENCES packs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  status workflow_status DEFAULT 'draft' NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(owner_id, slug)
);

CREATE TRIGGER projects_updated_at_trigger
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

CREATE INDEX IF NOT EXISTS projects_owner_id_idx ON projects(owner_id);
CREATE INDEX IF NOT EXISTS projects_team_id_idx ON projects(team_id);
CREATE INDEX IF NOT EXISTS projects_pack_id_idx ON projects(pack_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);

-- ============================================================================
-- WORKFLOWS TABLE (Workflow definitions and instances)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status workflow_status DEFAULT 'draft' NOT NULL,
  definition JSONB NOT NULL,
  config JSONB DEFAULT '{}'::JSONB NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  parent_workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER workflows_updated_at_trigger
BEFORE UPDATE ON workflows
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

CREATE INDEX IF NOT EXISTS workflows_project_id_idx ON workflows(project_id);
CREATE INDEX IF NOT EXISTS workflows_owner_id_idx ON workflows(owner_id);
CREATE INDEX IF NOT EXISTS workflows_status_idx ON workflows(status);
CREATE INDEX IF NOT EXISTS workflows_parent_workflow_id_idx ON workflows(parent_workflow_id);
CREATE INDEX IF NOT EXISTS workflows_created_at_idx ON workflows(created_at DESC);

-- ============================================================================
-- WORKFLOW_STEPS TABLE (Steps within workflows)
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL,
  status workflow_status DEFAULT 'draft' NOT NULL,
  config JSONB DEFAULT '{}'::JSONB NOT NULL,
  output JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(workflow_id, order_index)
);

CREATE TRIGGER workflow_steps_updated_at_trigger
BEFORE UPDATE ON workflow_steps
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

CREATE INDEX IF NOT EXISTS workflow_steps_workflow_id_idx ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS workflow_steps_order_idx ON workflow_steps(order_index);
CREATE INDEX IF NOT EXISTS workflow_steps_status_idx ON workflow_steps(status);

-- ============================================================================
-- SPECIFICATIONS TABLE (Project specifications with AI integration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  status spec_status DEFAULT 'draft' NOT NULL,
  model_used TEXT,
  version INTEGER DEFAULT 1 NOT NULL,
  parent_spec_id UUID REFERENCES specifications(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
  complexity_analysis JSONB,
  acceptance_criteria TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER specifications_updated_at_trigger
BEFORE UPDATE ON specifications
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

CREATE INDEX IF NOT EXISTS specifications_workflow_id_idx ON specifications(workflow_id);
CREATE INDEX IF NOT EXISTS specifications_project_id_idx ON specifications(project_id);
CREATE INDEX IF NOT EXISTS specifications_owner_id_idx ON specifications(owner_id);
CREATE INDEX IF NOT EXISTS specifications_status_idx ON specifications(status);
CREATE INDEX IF NOT EXISTS specifications_parent_spec_id_idx ON specifications(parent_spec_id);
CREATE INDEX IF NOT EXISTS specifications_created_at_idx ON specifications(created_at DESC);
CREATE INDEX IF NOT EXISTS specifications_tags_idx ON specifications USING gin(tags);

-- ============================================================================
-- AUDIT_LOGS TABLE (Activity and change tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_entity_type_idx ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS audit_logs_entity_id_idx ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view their own profile
CREATE POLICY profiles_view_own ON profiles
FOR SELECT USING (auth.uid() = id);

-- Users can view public profiles
CREATE POLICY profiles_view_public ON profiles
FOR SELECT USING (is_active = TRUE);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- TEAMS POLICIES
-- Team members can view team data
CREATE POLICY teams_view_member ON teams
FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
  )
);

-- Team owner can update team
CREATE POLICY teams_update_owner ON teams
FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- TEAM_MEMBERS POLICIES
-- Team members can view team membership
CREATE POLICY team_members_view ON team_members
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = team_members.team_id
    AND teams.owner_id = auth.uid()
  )
);

-- PACKS POLICIES
-- Users can view public packs
CREATE POLICY packs_view_public ON packs
FOR SELECT USING (is_public = TRUE);

-- Users can view their own packs
CREATE POLICY packs_view_own ON packs
FOR SELECT USING (owner_id = auth.uid());

-- Users can create packs
CREATE POLICY packs_insert ON packs
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own packs
CREATE POLICY packs_update_own ON packs
FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- PROJECTS POLICIES
-- Users can view their own projects
CREATE POLICY projects_view_own ON projects
FOR SELECT USING (owner_id = auth.uid());

-- Team members can view team projects
CREATE POLICY projects_view_team ON projects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = projects.team_id
    AND team_members.user_id = auth.uid()
  )
);

-- Users can create projects
CREATE POLICY projects_insert ON projects
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own projects
CREATE POLICY projects_update_own ON projects
FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- WORKFLOWS POLICIES
-- Users can view their own workflows
CREATE POLICY workflows_view_own ON workflows
FOR SELECT USING (owner_id = auth.uid());

-- Users can view workflows in their projects
CREATE POLICY workflows_view_project ON workflows
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = workflows.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Users can create workflows
CREATE POLICY workflows_insert ON workflows
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own workflows
CREATE POLICY workflows_update_own ON workflows
FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- WORKFLOW_STEPS POLICIES
-- Users can view steps in their workflows
CREATE POLICY workflow_steps_view ON workflow_steps
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM workflows
    WHERE workflows.id = workflow_steps.workflow_id
    AND workflows.owner_id = auth.uid()
  )
);

-- Users can create/update steps in their workflows
CREATE POLICY workflow_steps_insert ON workflow_steps
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM workflows
    WHERE workflows.id = workflow_steps.workflow_id
    AND workflows.owner_id = auth.uid()
  )
);

CREATE POLICY workflow_steps_update ON workflow_steps
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM workflows
    WHERE workflows.id = workflow_steps.workflow_id
    AND workflows.owner_id = auth.uid()
  )
);

-- SPECIFICATIONS POLICIES
-- Users can view their own specifications
CREATE POLICY specifications_view_own ON specifications
FOR SELECT USING (owner_id = auth.uid());

-- Users can view specs in their projects
CREATE POLICY specifications_view_project ON specifications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = specifications.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Users can create specifications
CREATE POLICY specifications_insert ON specifications
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Users can update their own specifications
CREATE POLICY specifications_update_own ON specifications
FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- AUDIT_LOGS POLICIES
-- Users can view their own audit logs
CREATE POLICY audit_logs_view ON audit_logs
FOR SELECT USING (user_id = auth.uid());

-- Only service role can insert audit logs
CREATE POLICY audit_logs_insert ON audit_logs
FOR INSERT WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action audit_action,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_changes JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_changes, p_ip_address, p_user_agent)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's team memberships
CREATE OR REPLACE FUNCTION get_user_teams(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  role user_role
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.slug,
    tm.role
  FROM teams t
  LEFT JOIN team_members tm ON t.id = tm.team_id
  WHERE t.owner_id = p_user_id OR tm.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user role in team
CREATE OR REPLACE FUNCTION get_user_team_role(p_team_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Check if user is team owner
  SELECT role INTO v_role FROM teams WHERE id = p_team_id AND owner_id = p_user_id;
  IF v_role IS NOT NULL THEN
    RETURN 'owner'::user_role;
  END IF;

  -- Check if user is team member
  SELECT role INTO v_role FROM team_members
  WHERE team_id = p_team_id AND user_id = p_user_id;

  RETURN COALESCE(v_role, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with authentication and settings';
COMMENT ON TABLE teams IS 'Team management for collaboration';
COMMENT ON TABLE team_members IS 'Team membership with role-based access control';
COMMENT ON TABLE packs IS 'LionPacks - reusable templates, processes, and workflows';
COMMENT ON TABLE projects IS 'User projects created from LionPacks';
COMMENT ON TABLE workflows IS 'Workflow definitions and instances';
COMMENT ON TABLE workflow_steps IS 'Individual steps within workflows';
COMMENT ON TABLE specifications IS 'AI-generated and refined project specifications';
COMMENT ON TABLE audit_logs IS 'Activity and change tracking for compliance';

COMMENT ON COLUMN profiles.settings IS 'User preferences and configuration stored as JSON';
COMMENT ON COLUMN workflows.definition IS 'Complete workflow definition and structure';
COMMENT ON COLUMN specifications.metadata IS 'Specification metadata including AI model info';
COMMENT ON COLUMN specifications.complexity_analysis IS 'AI-generated complexity analysis';

-- ============================================================================
-- INITIAL SEEDING (Optional - remove if not needed)
-- ============================================================================

-- Sample data creation would go here for testing purposes
-- This is typically handled by migrations/seeds scripts

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service role (for functions and server operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
