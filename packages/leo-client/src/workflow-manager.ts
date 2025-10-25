/**
 * 🦁 LionPack Studio - Workflow Manager
 *
 * Manages workflow state, transitions, and persistence
 * Uses in-memory storage for Phase 1, will integrate Supabase in Phase 2
 */

import type { Workflow } from './types'

export interface WorkflowFilter {
  project_id?: string
  status?: Workflow['status']
  assigned_to?: string
  created_after?: Date
  created_before?: Date
}

/**
 * In-memory storage for workflows (Phase 1)
 * Will be replaced with Supabase in Phase 2
 */
const workflowStore: Map<string, Workflow> = new Map()

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export class WorkflowManager {
  /**
   * Create a new workflow
   */
  async create(data: {
    project_id: string
    title: string
    description: string
    github_issue_id?: number
  }): Promise<Workflow> {
    const id = generateId()
    const now = new Date()

    const workflow: Workflow = {
      id,
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      github_issue_id: data.github_issue_id,
      status: 'todo',
      assigned_to: undefined,
      assigned_role: undefined,
      created_at: now,
      updated_at: now,
    }

    workflowStore.set(id, workflow)
    return workflow
  }

  /**
   * Get workflow by ID
   */
  async getById(id: string): Promise<Workflow | null> {
    return workflowStore.get(id) || null
  }

  /**
   * List workflows with filters
   */
  async list(filter: WorkflowFilter): Promise<Workflow[]> {
    let results = Array.from(workflowStore.values())

    // Apply filters
    if (filter.project_id) {
      results = results.filter((w) => w.project_id === filter.project_id)
    }

    if (filter.status) {
      results = results.filter((w) => w.status === filter.status)
    }

    if (filter.assigned_to) {
      results = results.filter((w) => w.assigned_to === filter.assigned_to)
    }

    if (filter.created_after) {
      results = results.filter((w) => w.created_at >= filter.created_after!)
    }

    if (filter.created_before) {
      results = results.filter((w) => w.created_at <= filter.created_before!)
    }

    return results
  }

  /**
   * Update workflow status
   */
  async updateStatus(
    id: string,
    status: Workflow['status']
  ): Promise<Workflow> {
    const workflow = workflowStore.get(id)
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`)
    }

    const validStatuses: Workflow['status'][] = [
      'todo',
      'in-progress',
      'in-review',
      'done',
      'blocked',
    ]
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`)
    }

    workflow.status = status
    workflow.updated_at = new Date()
    workflowStore.set(id, workflow)

    return workflow
  }

  /**
   * Assign workflow to pack member
   */
  async assign(
    id: string,
    userId: string,
    role: 'architect' | 'developer' | 'reviewer'
  ): Promise<Workflow> {
    const workflow = workflowStore.get(id)
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`)
    }

    workflow.assigned_to = userId
    workflow.assigned_role = role
    workflow.updated_at = new Date()
    workflowStore.set(id, workflow)

    return workflow
  }

  /**
   * Delete workflow (soft delete - just mark as archived)
   */
  async delete(id: string): Promise<void> {
    const workflow = workflowStore.get(id)
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`)
    }

    workflowStore.delete(id)
  }

  /**
   * Clear all workflows (for testing)
   */
  async clear(): Promise<void> {
    workflowStore.clear()
  }
}
