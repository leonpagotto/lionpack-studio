/**
 * Database Types and Interfaces
 * Auto-generated from PostgreSQL schema
 * 
 * These types reflect the structure defined in:
 * packages/database/migrations/001_initial_schema.sql
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  Admin = 'admin',
  Owner = 'owner',
  Editor = 'editor',
  Viewer = 'viewer',
  Member = 'member',
}

export enum WorkflowStatus {
  Draft = 'draft',
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
  Archived = 'archived',
}

export enum SpecStatus {
  Draft = 'draft',
  Generated = 'generated',
  Refined = 'refined',
  Approved = 'approved',
  Implemented = 'implemented',
  Archived = 'archived',
}

export enum AuditAction {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Archive = 'archive',
  Restore = 'restore',
  Share = 'share',
  Unshare = 'unshare',
}

// ============================================================================
// PROFILE TYPE
// ============================================================================

export interface Profile {
  id: string; // UUID
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  organization?: string;
  role: UserRole;
  settings: Record<string, any>;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  last_login_at?: string; // ISO timestamp
  is_active: boolean;
}

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

// ============================================================================
// TEAM TYPE
// ============================================================================

export interface Team {
  id: string; // UUID
  owner_id: string; // UUID
  name: string;
  slug: string;
  description?: string;
  avatar_url?: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type TeamInsert = Omit<Team, 'id' | 'created_at' | 'updated_at'>;
export type TeamUpdate = Partial<Omit<Team, 'id' | 'created_at' | 'owner_id'>>;

// ============================================================================
// TEAM MEMBER TYPE
// ============================================================================

export interface TeamMember {
  id: string; // UUID
  team_id: string; // UUID
  user_id: string; // UUID
  role: UserRole;
  joined_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

export type TeamMemberInsert = Omit<TeamMember, 'id' | 'joined_at' | 'created_at'>;
export type TeamMemberUpdate = Partial<Pick<TeamMember, 'role'>>;

// ============================================================================
// PACK TYPE (LionPack)
// ============================================================================

export interface Pack {
  id: string; // UUID
  owner_id: string; // UUID
  team_id?: string; // UUID | NULL
  name: string;
  slug: string;
  description?: string;
  version: string;
  category?: string;
  tags: string[];
  template_data?: Record<string, any>;
  is_public: boolean;
  is_template: boolean;
  download_count: number;
  rating?: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type PackInsert = Omit<Pack, 'id' | 'created_at' | 'updated_at' | 'download_count'>;
export type PackUpdate = Partial<Omit<Pack, 'id' | 'created_at' | 'owner_id' | 'slug'>>;

// ============================================================================
// PROJECT TYPE
// ============================================================================

export interface Project {
  id: string; // UUID
  owner_id: string; // UUID
  team_id?: string; // UUID | NULL
  pack_id?: string; // UUID | NULL
  name: string;
  slug: string;
  description?: string;
  status: WorkflowStatus;
  metadata: Record<string, any>;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'created_at' | 'owner_id' | 'slug'>>;

// ============================================================================
// WORKFLOW TYPE
// ============================================================================

export interface Workflow {
  id: string; // UUID
  project_id: string; // UUID
  owner_id: string; // UUID
  name: string;
  description?: string;
  status: WorkflowStatus;
  definition: Record<string, any>;
  config: Record<string, any>;
  version: number;
  parent_workflow_id?: string; // UUID | NULL
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  started_at?: string; // ISO timestamp | NULL
  completed_at?: string; // ISO timestamp | NULL
}

export type WorkflowInsert = Omit<Workflow, 'id' | 'created_at' | 'updated_at' | 'version'>;
export type WorkflowUpdate = Partial<Omit<Workflow, 'id' | 'created_at' | 'project_id' | 'owner_id'>>;

// ============================================================================
// WORKFLOW STEP TYPE
// ============================================================================

export interface WorkflowStep {
  id: string; // UUID
  workflow_id: string; // UUID
  order_index: number;
  name: string;
  description?: string;
  step_type: string;
  status: WorkflowStatus;
  config: Record<string, any>;
  output?: Record<string, any>;
  duration_ms?: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export type WorkflowStepInsert = Omit<WorkflowStep, 'id' | 'created_at' | 'updated_at'>;
export type WorkflowStepUpdate = Partial<Omit<WorkflowStep, 'id' | 'created_at' | 'workflow_id' | 'order_index'>>;

// ============================================================================
// SPECIFICATION TYPE
// ============================================================================

export interface Specification {
  id: string; // UUID
  workflow_id: string; // UUID
  project_id: string; // UUID
  owner_id: string; // UUID
  title: string;
  description?: string;
  content?: string;
  status: SpecStatus;
  model_used?: string;
  version: number;
  parent_spec_id?: string; // UUID | NULL
  metadata: Record<string, any>;
  complexity_analysis?: Record<string, any>;
  acceptance_criteria?: string[];
  tags: string[];
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  published_at?: string; // ISO timestamp | NULL
  approved_by?: string; // UUID | NULL
  approved_at?: string; // ISO timestamp | NULL
}

export type SpecificationInsert = Omit<Specification, 'id' | 'created_at' | 'updated_at' | 'version'>;
export type SpecificationUpdate = Partial<Omit<Specification, 'id' | 'created_at' | 'workflow_id' | 'project_id' | 'owner_id'>>;

// ============================================================================
// AUDIT LOG TYPE
// ============================================================================

export interface AuditLog {
  id: string; // UUID
  user_id?: string; // UUID | NULL
  action: AuditAction;
  entity_type: string;
  entity_id: string; // UUID
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string; // ISO timestamp
}

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>;

// ============================================================================
// AGGREGATE/JOIN TYPES
// ============================================================================

/**
 * User with all their teams
 */
export interface UserWithTeams extends Profile {
  teams: (Team & { role: UserRole })[];
}

/**
 * Team with members
 */
export interface TeamWithMembers extends Team {
  members: (Profile & { role: UserRole; joined_at: string })[];
}

/**
 * Project with workflows
 */
export interface ProjectWithWorkflows extends Project {
  workflows: Workflow[];
}

/**
 * Workflow with steps
 */
export interface WorkflowWithSteps extends Workflow {
  steps: WorkflowStep[];
}

/**
 * Specification with workflow context
 */
export interface SpecificationWithContext extends Specification {
  workflow?: Workflow;
  project?: Project;
  approved_by_user?: Profile;
}

// ============================================================================
// DATABASE QUERY TYPES
// ============================================================================

/**
 * Parameters for filtering and pagination
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a user has a specific role in a resource
 */
export function hasRole(
  userRole: UserRole,
  requiredRole: UserRole | UserRole[]
): boolean {
  const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Define role hierarchy
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.Admin]: 5,
    [UserRole.Owner]: 4,
    [UserRole.Editor]: 3,
    [UserRole.Viewer]: 2,
    [UserRole.Member]: 1,
  };

  const userRoleLevel = roleHierarchy[userRole] || 0;
  return required.some(role => userRoleLevel >= (roleHierarchy[role] || 0));
}

/**
 * Check if user can edit a resource
 */
export function canEdit(userRole: UserRole): boolean {
  return hasRole(userRole, [UserRole.Admin, UserRole.Owner, UserRole.Editor]);
}

/**
 * Check if user can view a resource
 */
export function canView(userRole: UserRole): boolean {
  return hasRole(userRole, [
    UserRole.Admin,
    UserRole.Owner,
    UserRole.Editor,
    UserRole.Viewer,
    UserRole.Member,
  ]);
}

/**
 * Check if user can manage team
 */
export function canManageTeam(userRole: UserRole): boolean {
  return hasRole(userRole, [UserRole.Admin, UserRole.Owner]);
}

export default {
  UserRole,
  WorkflowStatus,
  SpecStatus,
  AuditAction,
  hasRole,
  canEdit,
  canView,
  canManageTeam,
};
