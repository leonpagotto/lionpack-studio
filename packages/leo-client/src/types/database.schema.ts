/**
 * Auto-generated Supabase Database Schema Types
 * Generated from PostgreSQL schema in packages/database/migrations/001_initial_schema.sql
 * 
 * This file should be kept in sync with the database schema.
 * To regenerate: supabase gen types typescript --schema public
 */

import type { UserRole, WorkflowStatus, SpecStatus, AuditAction } from './database';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          organization: string | null;
          role: UserRole;
          settings: Record<string, any>;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          organization?: string | null;
          role?: UserRole;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          organization?: string | null;
          role?: UserRole;
          settings?: Record<string, any>;
          updated_at?: string;
          last_login_at?: string | null;
          is_active?: boolean;
        };
      };
      teams: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          avatar_url: string | null;
          settings: Record<string, any>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          avatar_url?: string | null;
          settings?: Record<string, any>;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          avatar_url?: string | null;
          settings?: Record<string, any>;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: UserRole;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: UserRole;
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: UserRole;
          joined_at?: string;
          created_at?: string;
        };
      };
      packs: {
        Row: {
          id: string;
          owner_id: string;
          team_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          version: string;
          category: string | null;
          tags: string[];
          template_data: Record<string, any> | null;
          is_public: boolean;
          is_template: boolean;
          download_count: number;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          team_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          version?: string;
          category?: string | null;
          tags?: string[];
          template_data?: Record<string, any> | null;
          is_public?: boolean;
          is_template?: boolean;
          download_count?: number;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          team_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          version?: string;
          category?: string | null;
          tags?: string[];
          template_data?: Record<string, any> | null;
          is_public?: boolean;
          is_template?: boolean;
          download_count?: number;
          rating?: number | null;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          team_id: string | null;
          pack_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          status: WorkflowStatus;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          team_id?: string | null;
          pack_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          status?: WorkflowStatus;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          team_id?: string | null;
          pack_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          status?: WorkflowStatus;
          metadata?: Record<string, any>;
          updated_at?: string;
        };
      };
      workflows: {
        Row: {
          id: string;
          project_id: string;
          owner_id: string;
          name: string;
          description: string | null;
          status: WorkflowStatus;
          definition: Record<string, any>;
          config: Record<string, any>;
          version: number;
          parent_workflow_id: string | null;
          created_at: string;
          updated_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          owner_id: string;
          name: string;
          description?: string | null;
          status?: WorkflowStatus;
          definition: Record<string, any>;
          config?: Record<string, any>;
          version?: number;
          parent_workflow_id?: string | null;
          created_at?: string;
          updated_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          status?: WorkflowStatus;
          definition?: Record<string, any>;
          config?: Record<string, any>;
          version?: number;
          parent_workflow_id?: string | null;
          updated_at?: string;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      workflow_steps: {
        Row: {
          id: string;
          workflow_id: string;
          order_index: number;
          name: string;
          description: string | null;
          step_type: string;
          status: WorkflowStatus;
          config: Record<string, any>;
          output: Record<string, any> | null;
          duration_ms: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          order_index: number;
          name: string;
          description?: string | null;
          step_type: string;
          status?: WorkflowStatus;
          config?: Record<string, any>;
          output?: Record<string, any> | null;
          duration_ms?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          order_index?: number;
          name?: string;
          description?: string | null;
          step_type?: string;
          status?: WorkflowStatus;
          config?: Record<string, any>;
          output?: Record<string, any> | null;
          duration_ms?: number | null;
          updated_at?: string;
        };
      };
      specifications: {
        Row: {
          id: string;
          workflow_id: string;
          project_id: string;
          owner_id: string;
          title: string;
          description: string | null;
          content: string | null;
          status: SpecStatus;
          model_used: string | null;
          version: number;
          parent_spec_id: string | null;
          metadata: Record<string, any>;
          complexity_analysis: Record<string, any> | null;
          acceptance_criteria: string[] | null;
          tags: string[];
          created_at: string;
          updated_at: string;
          published_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          project_id: string;
          owner_id: string;
          title: string;
          description?: string | null;
          content?: string | null;
          status?: SpecStatus;
          model_used?: string | null;
          version?: number;
          parent_spec_id?: string | null;
          metadata?: Record<string, any>;
          complexity_analysis?: Record<string, any> | null;
          acceptance_criteria?: string[] | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          project_id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          content?: string | null;
          status?: SpecStatus;
          model_used?: string | null;
          version?: number;
          parent_spec_id?: string | null;
          metadata?: Record<string, any>;
          complexity_analysis?: Record<string, any> | null;
          acceptance_criteria?: string[] | null;
          tags?: string[];
          updated_at?: string;
          published_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: AuditAction;
          entity_type: string;
          entity_id: string;
          changes: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: AuditAction;
          entity_type: string;
          entity_id: string;
          changes?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: AuditAction;
          entity_type?: string;
          entity_id?: string;
          changes?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      create_audit_log: {
        Args: {
          p_action: AuditAction;
          p_entity_type: string;
          p_entity_id: string;
          p_changes?: Record<string, any>;
          p_ip_address?: string;
          p_user_agent?: string;
        };
        Returns: string; // UUID
      };
      get_user_teams: {
        Args: {
          p_user_id?: string;
        };
        Returns: Array<{
          id: string;
          name: string;
          slug: string;
          role: UserRole;
        }>;
      };
      get_user_team_role: {
        Args: {
          p_team_id: string;
          p_user_id?: string;
        };
        Returns: UserRole | null;
      };
    };
    Enums: {
      user_role: UserRole;
      workflow_status: WorkflowStatus;
      spec_status: SpecStatus;
      audit_action: AuditAction;
    };
  };
}
