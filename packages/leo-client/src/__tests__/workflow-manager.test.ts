/**
 * 🦁 LionPack Studio - WorkflowManager Tests
 *
 * Unit tests for workflow CRUD operations and state management
 */

import { WorkflowManager, type WorkflowFilter } from '../workflow-manager'
import type { Workflow } from '../types'

describe('WorkflowManager', () => {
  let manager: WorkflowManager

  beforeEach(() => {
    manager = new WorkflowManager()
  })

  afterEach(async () => {
    await manager.clear()
  })

  describe('create', () => {
    it('should create a workflow with valid data', async () => {
      const data = {
        project_id: 'proj-1',
        title: 'Implement OAuth2',
        description: 'Add OAuth2 authentication support',
      }

      const workflow = await manager.create(data)

      expect(workflow).toBeDefined()
      expect(workflow.id).toMatch(/^workflow-/)
      expect(workflow.project_id).toBe('proj-1')
      expect(workflow.title).toBe('Implement OAuth2')
      expect(workflow.description).toBe('Add OAuth2 authentication support')
      expect(workflow.status).toBe('todo')
      expect(workflow.assigned_to).toBeUndefined()
      expect(workflow.assigned_role).toBeUndefined()
      expect(workflow.created_at).toBeInstanceOf(Date)
      expect(workflow.updated_at).toBeInstanceOf(Date)
    })

    it('should create a workflow with github_issue_id', async () => {
      const data = {
        project_id: 'proj-1',
        title: 'Fix bug',
        description: 'Fix the login form',
        github_issue_id: 42,
      }

      const workflow = await manager.create(data)

      expect(workflow.github_issue_id).toBe(42)
    })

    it('should generate unique IDs for multiple workflows', async () => {
      const data = {
        project_id: 'proj-1',
        title: 'Task 1',
        description: 'Description 1',
      }

      const workflow1 = await manager.create(data)
      const workflow2 = await manager.create(data)

      expect(workflow1.id).not.toBe(workflow2.id)
    })
  })

  describe('getById', () => {
    it('should return workflow by ID', async () => {
      const created = await manager.create({
        project_id: 'proj-1',
        title: 'Test Task',
        description: 'Test',
      })

      const retrieved = await manager.getById(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.title).toBe('Test Task')
    })

    it('should return null for non-existent workflow', async () => {
      const result = await manager.getById('non-existent-id')

      expect(result).toBeNull()
    })
  })

  describe('list', () => {
    beforeEach(async () => {
      await manager.create({
        project_id: 'proj-1',
        title: 'Task 1',
        description: 'Desc 1',
      })
      await manager.create({
        project_id: 'proj-1',
        title: 'Task 2',
        description: 'Desc 2',
      })
      await manager.create({
        project_id: 'proj-2',
        title: 'Task 3',
        description: 'Desc 3',
      })
    })

    it('should list all workflows without filter', async () => {
      const workflows = await manager.list({})

      expect(workflows).toHaveLength(3)
    })

    it('should filter workflows by project_id', async () => {
      const workflows = await manager.list({ project_id: 'proj-1' })

      expect(workflows).toHaveLength(2)
      expect(workflows.every((w) => w.project_id === 'proj-1')).toBe(true)
    })

    it('should filter workflows by status', async () => {
      const wf = await manager.create({
        project_id: 'proj-1',
        title: 'Task',
        description: 'Desc',
      })

      await manager.updateStatus(wf.id, 'in-progress')

      const workflows = await manager.list({ status: 'in-progress' })

      expect(workflows).toHaveLength(1)
      expect(workflows[0].status).toBe('in-progress')
    })

    it('should filter workflows by assigned_to', async () => {
      const wf = await manager.create({
        project_id: 'proj-1',
        title: 'Task',
        description: 'Desc',
      })

      await manager.assign(wf.id, 'user-1', 'developer')

      const workflows = await manager.list({ assigned_to: 'user-1' })

      expect(workflows).toHaveLength(1)
      expect(workflows[0].assigned_to).toBe('user-1')
    })

    it('should filter by created_after date', async () => {
      const beforeDate = new Date(Date.now() - 60000) // 1 minute ago
      const workflows = await manager.list({ created_after: beforeDate })

      expect(workflows.length).toBeGreaterThan(0)
      expect(workflows.every((w) => w.created_at >= beforeDate)).toBe(true)
    })

    it('should filter by created_before date', async () => {
      const afterDate = new Date(Date.now() + 60000) // 1 minute from now
      const workflows = await manager.list({ created_before: afterDate })

      expect(workflows.length).toBeGreaterThan(0)
      expect(workflows.every((w) => w.created_at <= afterDate)).toBe(true)
    })

    it('should combine multiple filters', async () => {
      const wf = await manager.create({
        project_id: 'proj-1',
        title: 'Task',
        description: 'Desc',
      })

      await manager.updateStatus(wf.id, 'in-progress')
      await manager.assign(wf.id, 'user-1', 'architect')

      const workflows = await manager.list({
        project_id: 'proj-1',
        status: 'in-progress',
        assigned_to: 'user-1',
      })

      expect(workflows).toHaveLength(1)
      expect(workflows[0].id).toBe(wf.id)
    })
  })

  describe('updateStatus', () => {
    let workflow: Workflow

    beforeEach(async () => {
      workflow = await manager.create({
        project_id: 'proj-1',
        title: 'Task',
        description: 'Desc',
      })
    })

    it('should update workflow status', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      const updated = await manager.updateStatus(workflow.id, 'in-progress')

      expect(updated.status).toBe('in-progress')
      expect(updated.updated_at.getTime()).toBeGreaterThanOrEqual(
        workflow.updated_at.getTime()
      )
    })

    it('should transition through valid statuses', async () => {
      const statuses: Array<Workflow['status']> = [
        'in-progress',
        'in-review',
        'done',
      ]

      let current = workflow

      for (const status of statuses) {
        current = await manager.updateStatus(current.id, status)
        expect(current.status).toBe(status)
      }
    })

    it('should reject invalid status', async () => {
      await expect(
        manager.updateStatus(workflow.id, 'invalid' as any)
      ).rejects.toThrow('Invalid status')
    })

    it('should throw error for non-existent workflow', async () => {
      await expect(
        manager.updateStatus('non-existent', 'in-progress')
      ).rejects.toThrow('not found')
    })
  })

  describe('assign', () => {
    let workflow: Workflow

    beforeEach(async () => {
      workflow = await manager.create({
        project_id: 'proj-1',
        title: 'Task',
        description: 'Desc',
      })
    })

    it('should assign workflow to user with role', async () => {
      const assigned = await manager.assign(workflow.id, 'user-1', 'developer')

      expect(assigned.assigned_to).toBe('user-1')
      expect(assigned.assigned_role).toBe('developer')
    })

    it('should allow reassignment to different user', async () => {
      await manager.assign(workflow.id, 'user-1', 'developer')
      const reassigned = await manager.assign(workflow.id, 'user-2', 'architect')

      expect(reassigned.assigned_to).toBe('user-2')
      expect(reassigned.assigned_role).toBe('architect')
    })

    it('should support all valid roles', async () => {
      const roles: Array<'architect' | 'developer' | 'reviewer'> = [
        'architect',
        'developer',
        'reviewer',
      ]

      for (const role of roles) {
        const assigned = await manager.assign(workflow.id, 'user-1', role)
        expect(assigned.assigned_role).toBe(role)
      }
    })

    it('should throw error for non-existent workflow', async () => {
      await expect(
        manager.assign('non-existent', 'user-1', 'developer')
      ).rejects.toThrow('not found')
    })

    it('should update the updated_at timestamp', async () => {
      const before = workflow.updated_at

      await new Promise((resolve) => setTimeout(resolve, 10))
      const assigned = await manager.assign(workflow.id, 'user-1', 'developer')

      expect(assigned.updated_at.getTime()).toBeGreaterThan(before.getTime())
    })
  })

  describe('delete', () => {
    it('should delete workflow', async () => {
      const workflow = await manager.create({
        project_id: 'proj-1',
        title: 'Task',
        description: 'Desc',
      })

      await manager.delete(workflow.id)

      const retrieved = await manager.getById(workflow.id)
      expect(retrieved).toBeNull()
    })

    it('should throw error for non-existent workflow', async () => {
      await expect(manager.delete('non-existent')).rejects.toThrow(
        'not found'
      )
    })
  })

  describe('clear', () => {
    it('should clear all workflows', async () => {
      await manager.create({
        project_id: 'proj-1',
        title: 'Task 1',
        description: 'Desc 1',
      })
      await manager.create({
        project_id: 'proj-1',
        title: 'Task 2',
        description: 'Desc 2',
      })

      let workflows = await manager.list({})
      expect(workflows).toHaveLength(2)

      await manager.clear()

      workflows = await manager.list({})
      expect(workflows).toHaveLength(0)
    })
  })

  describe('integration scenarios', () => {
    it('should handle full workflow lifecycle', async () => {
      // Create
      const workflow = await manager.create({
        project_id: 'proj-1',
        title: 'Implement feature',
        description: 'Add new functionality',
        github_issue_id: 123,
      })

      expect(workflow.status).toBe('todo')

      // Assign
      let updated = await manager.assign(workflow.id, 'dev-1', 'developer')
      expect(updated.assigned_to).toBe('dev-1')

      // Transition through statuses
      updated = await manager.updateStatus(workflow.id, 'in-progress')
      expect(updated.status).toBe('in-progress')

      updated = await manager.updateStatus(workflow.id, 'in-review')
      expect(updated.status).toBe('in-review')

      updated = await manager.updateStatus(workflow.id, 'done')
      expect(updated.status).toBe('done')

      // Verify final state
      const final = await manager.getById(workflow.id)
      expect(final?.status).toBe('done')
      expect(final?.assigned_to).toBe('dev-1')
    })

    it('should maintain data consistency across operations', async () => {
      const created = await manager.create({
        project_id: 'proj-1',
        title: 'Task',
        description: 'Description',
      })

      const retrieved1 = await manager.getById(created.id)
      const retrieved2 = await manager.getById(created.id)

      expect(retrieved1).toEqual(retrieved2)
    })

    it('should handle concurrent-like operations', async () => {
      const workflows = await Promise.all([
        manager.create({
          project_id: 'proj-1',
          title: 'Task 1',
          description: 'Desc 1',
        }),
        manager.create({
          project_id: 'proj-1',
          title: 'Task 2',
          description: 'Desc 2',
        }),
        manager.create({
          project_id: 'proj-1',
          title: 'Task 3',
          description: 'Desc 3',
        }),
      ])

      expect(workflows).toHaveLength(3)
      expect(new Set(workflows.map((w) => w.id)).size).toBe(3)

      const all = await manager.list({})
      expect(all).toHaveLength(3)
    })
  })
})
