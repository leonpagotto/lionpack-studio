/**
 * Database Service Layer
 * Provides typed database operations with error handling and validation
 *
 * This service layer handles all database operations and provides
 * a clean interface for API routes and business logic.
 */

import { supabase, supabaseAdmin, getSupabaseClient } from './supabase-client';
import type {
  Profile,
  Team,
  TeamMember,
  Pack,
  Project,
  Workflow,
  WorkflowStep,
  Specification,
  AuditLog,
  UserRole,
  WorkflowStatus,
  SpecStatus,
  AuditAction,
  PaginatedResponse,
  QueryOptions,
} from '../types/database';

// ============================================================================
// ERROR HANDLING
// ============================================================================

class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string = 'DB_ERROR',
    public status: number = 500
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// ============================================================================
// PROFILE SERVICE
// ============================================================================

export const profileService = {
  /**
   * Get profile by ID
   */
  async getById(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new DatabaseError(`Failed to get profile: ${error.message}`);
    }
  },

  /**
   * Create profile
   */
  async create(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new DatabaseError(`Failed to create profile: ${error.message}`);
    }
  },

  /**
   * Update profile
   */
  async update(userId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new DatabaseError(`Failed to update profile: ${error.message}`);
    }
  },

  /**
   * Get or create profile
   */
  async getOrCreate(
    userId: string,
    email: string,
    defaults?: Partial<Profile>
  ): Promise<Profile> {
    const existing = await this.getById(userId);
    if (existing) return existing;

    return this.create({
      id: userId,
      email,
      role: 'member' as UserRole,
      is_active: true,
      settings: {},
      ...defaults,
    });
  },
};

// ============================================================================
// TEAM SERVICE
// ============================================================================

export const teamService = {
  /**
   * Get team by ID
   */
  async getById(teamId: string): Promise<Team | null> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (error.code === 'PGRST116') return null;
      throw new DatabaseError(`Failed to get team: ${error.message}`);
    }
  },

  /**
   * Create team
   */
  async create(
    ownerId: string,
    name: string,
    slug: string,
    options?: { description?: string; avatar_url?: string }
  ): Promise<Team> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([
          {
            owner_id: ownerId,
            name,
            slug,
            description: options?.description,
            avatar_url: options?.avatar_url,
            settings: {},
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new DatabaseError(`Failed to create team: ${error.message}`);
    }
  },

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string): Promise<(Team & { role: UserRole })[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_teams', { p_user_id: userId });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new DatabaseError(`Failed to get user teams: ${error.message}`);
    }
  },
};

// ============================================================================
// PROJECT SERVICE
// ============================================================================

export const projectService = {
  /**
   * Get project by ID
   */
  async getById(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (error.code === 'PGRST116') return null;
      throw new DatabaseError(`Failed to get project: ${error.message}`);
    }
  },

  /**
   * Create project
   */
  async create(
    ownerId: string,
    name: string,
    slug: string,
    options?: {
      description?: string;
      packId?: string;
      teamId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            owner_id: ownerId,
            name,
            slug,
            description: options?.description,
            pack_id: options?.packId,
            team_id: options?.teamId,
            metadata: options?.metadata || {},
            status: 'draft' as WorkflowStatus,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new DatabaseError(`Failed to create project: ${error.message}`);
    }
  },

  /**
   * List user projects with pagination
   */
  async listByOwner(
    ownerId: string,
    options?: QueryOptions
  ): Promise<PaginatedResponse<Project>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('owner_id', ownerId);

      if (options?.sort_by) {
        const direction = options?.sort_direction === 'asc' ? true : false;
        query = query.order(options.sort_by, { ascending: direction });
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list projects: ${error.message}`);
    }
  },
};

// ============================================================================
// WORKFLOW SERVICE
// ============================================================================

export const workflowService = {
  /**
   * Get workflow by ID
   */
  async getById(workflowId: string): Promise<Workflow | null> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (error.code === 'PGRST116') return null;
      throw new DatabaseError(`Failed to get workflow: ${error.message}`);
    }
  },

  /**
   * Create workflow
   */
  async create(
    projectId: string,
    ownerId: string,
    name: string,
    definition: Record<string, any>,
    options?: {
      description?: string;
      config?: Record<string, any>;
    }
  ): Promise<Workflow> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert([
          {
            project_id: projectId,
            owner_id: ownerId,
            name,
            definition,
            description: options?.description,
            config: options?.config || {},
            status: 'draft' as WorkflowStatus,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new DatabaseError(`Failed to create workflow: ${error.message}`);
    }
  },

  /**
   * List project workflows with pagination
   */
  async listByProject(
    projectId: string,
    options?: QueryOptions
  ): Promise<PaginatedResponse<Workflow>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      let query = supabase
        .from('workflows')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId);

      if (options?.sort_by) {
        const direction = options?.sort_direction === 'asc' ? true : false;
        query = query.order(options.sort_by, { ascending: direction });
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list workflows: ${error.message}`);
    }
  },
};

// ============================================================================
// SPECIFICATION SERVICE
// ============================================================================

export const specificationService = {
  /**
   * Get specification by ID
   */
  async getById(specId: string): Promise<Specification | null> {
    try {
      const { data, error } = await supabase
        .from('specifications')
        .select('*')
        .eq('id', specId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (error.code === 'PGRST116') return null;
      throw new DatabaseError(`Failed to get specification: ${error.message}`);
    }
  },

  /**
   * Create specification
   */
  async create(
    workflowId: string,
    projectId: string,
    ownerId: string,
    title: string,
    options?: {
      description?: string;
      content?: string;
      modelUsed?: string;
      metadata?: Record<string, any>;
      acceptanceCriteria?: string[];
      tags?: string[];
    }
  ): Promise<Specification> {
    try {
      const { data, error } = await supabase
        .from('specifications')
        .insert([
          {
            workflow_id: workflowId,
            project_id: projectId,
            owner_id: ownerId,
            title,
            description: options?.description,
            content: options?.content,
            model_used: options?.modelUsed,
            metadata: options?.metadata || {},
            acceptance_criteria: options?.acceptanceCriteria,
            tags: options?.tags || [],
            status: 'draft' as SpecStatus,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new DatabaseError(`Failed to create specification: ${error.message}`);
    }
  },

  /**
   * Update specification
   */
  async update(specId: string, updates: Partial<Specification>): Promise<Specification> {
    try {
      const { data, error } = await supabase
        .from('specifications')
        .update(updates)
        .eq('id', specId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new DatabaseError(`Failed to update specification: ${error.message}`);
    }
  },

  /**
   * List workflow specifications with pagination
   */
  async listByWorkflow(
    workflowId: string,
    options?: QueryOptions
  ): Promise<PaginatedResponse<Specification>> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      let query = supabase
        .from('specifications')
        .select('*', { count: 'exact' })
        .eq('workflow_id', workflowId);

      if (options?.sort_by) {
        const direction = options?.sort_direction === 'asc' ? true : false;
        query = query.order(options.sort_by, { ascending: direction });
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      };
    } catch (error: any) {
      throw new DatabaseError(`Failed to list specifications: ${error.message}`);
    }
  },
};

// ============================================================================
// AUDIT LOG SERVICE
// ============================================================================

export const auditLogService = {
  /**
   * Create audit log entry
   */
  async log(
    action: AuditAction,
    entityType: string,
    entityId: string,
    userId?: string,
    changes?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    try {
      const { data, error } = await (supabaseAdmin || supabase)
        .from('audit_logs')
        .insert([
          {
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            changes,
            ip_address: ipAddress,
            user_agent: userAgent,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logs shouldn't block operations
      throw new DatabaseError(`Failed to create audit log: ${error.message}`, 'AUDIT_LOG_ERROR', 400);
    }
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  DatabaseError,
  supabase,
  supabaseAdmin,
  getSupabaseClient,
};

export default {
  profileService,
  teamService,
  projectService,
  workflowService,
  specificationService,
  auditLogService,
};
