/**
 * 🦁 LionPack Studio - Shared Types
 *
 * Core TypeScript type definitions used across the LionPack Studio
 * frontend and backend.
 */

// User & Authentication
export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  role: 'owner' | 'admin' | 'user'
  created_at: Date
}

// Pack (Team)
export interface Pack {
  id: string
  name: string
  description?: string
  owner_id: string
  is_public: boolean
  created_at: Date
  updated_at: Date
}

export interface PackMember {
  id: string
  pack_id: string
  user_id: string
  role: 'owner' | 'architect' | 'developer' | 'reviewer' | 'viewer'
  joined_at: Date
}

// Project
export interface Project {
  id: string
  pack_id: string
  github_repo: string
  github_org: string
  name: string
  description?: string
  created_at: Date
}

// Workflow
export interface Workflow {
  id: string
  project_id: string
  github_issue_id: number
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'in-review' | 'done' | 'blocked'
  assigned_to?: string
  assigned_role?: PackMember['role']
  created_at: Date
  updated_at: Date
}

// Specification
export interface Specification {
  id: string
  workflow_id: string
  title: string
  description: string
  acceptance_criteria: string[]
  estimated_effort: string
  suggested_architecture: string
  model_used: 'sonnet' | '4' | '4-5' | 'haiku'
  created_at: Date
}

// Real-time Collaboration
export interface CollaborationEvent {
  type: 'file-change' | 'cursor-move' | 'selection' | 'comment' | 'status-update'
  user_id: string
  project_id: string
  timestamp: Date
  data: Record<string, unknown>
}

export interface UserPresence {
  user_id: string
  username: string
  avatar_url?: string
  file?: string
  cursor_line?: number
  cursor_column?: number
  color: string
  timestamp: Date
}

// API Responses
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  timestamp: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// Workflow Orchestration
export interface WorkflowOrchestrationResult {
  workflow_id: string
  github_issue_url: string
  agents_assigned: string[]
  spec_generated: boolean
  estimated_effort: string
  next_step: string
}

// Editor File
export interface EditorFile {
  id: string
  project_id: string
  path: string
  name: string
  content: string
  language: string
  size: number
  last_modified: Date
  last_modified_by: string
}

// Chat Message (for Morphy integration)
export interface ChatMessage {
  id: string
  user_id: string
  project_id: string
  workflow_id?: string
  content: string
  role: 'user' | 'assistant'
  context?: {
    current_file?: string
    selection?: string
    workflow_status?: string
  }
  created_at: Date
}

// Task
export interface Task {
  id: string
  workflow_id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  assigned_to?: string
  due_date?: Date
  created_at: Date
  updated_at: Date
}

export type ModelName = 'sonnet' | '4' | '4-5' | 'haiku'

export interface ModelConfig {
  name: ModelName
  provider: 'anthropic'
  description: string
  context_window: number
  cost_per_1k_input: number
  cost_per_1k_output: number
  recommended_for: string[]
}
