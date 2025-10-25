/**
 * 🦁 LionPack Studio - List Workflows API Route
 * GET /api/workflows
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { APIResponse } from '@leo-client/types'
import type { Workflow } from '@leo-client/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Workflow[]>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Method ${req.method} not allowed. Use GET.`,
      },
    })
  }

  try {
    const { status, projectId, limit = '10', offset = '0' } = req.query

    // Validate query parameters
    const limitNum = Math.min(parseInt(limit as string) || 10, 100)
    const offsetNum = parseInt(offset as string) || 0

    if (limitNum < 1 || offsetNum < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAGINATION',
          message: 'Limit must be at least 1, offset must be non-negative',
        },
      })
    }

    // TODO: In production, fetch from Supabase with filters
    // const query = supabase
    //   .from('workflows')
    //   .select('*')
    //   .range(offsetNum, offsetNum + limitNum - 1)
    //
    // if (status && typeof status === 'string') {
    //   query.eq('status', status)
    // }
    //
    // if (projectId && typeof projectId === 'string') {
    //   query.eq('project_id', projectId)
    // }
    //
    // const { data: workflows, error } = await query

    // Mock workflows data for Phase 1
    const mockWorkflows: Workflow[] = [
      {
        id: 'workflow-1',
        project_id: 'project-123',
        title: 'Setup Authentication',
        description: 'Implement OAuth2 authentication',
        status: 'todo',
        created_at: new Date(Date.now() - 86400000),
        updated_at: new Date(Date.now() - 86400000),
      },
      {
        id: 'workflow-2',
        project_id: 'project-123',
        title: 'Build API Endpoints',
        description: 'Create REST API for users',
        status: 'in-progress',
        created_at: new Date(Date.now() - 172800000),
        updated_at: new Date(),
      },
      {
        id: 'workflow-3',
        project_id: 'project-123',
        title: 'Database Schema',
        description: 'Design PostgreSQL schema',
        status: 'done',
        created_at: new Date(Date.now() - 259200000),
        updated_at: new Date(Date.now() - 172800000),
      },
    ]

    // Apply filters if provided
    let filtered = mockWorkflows
    if (status && typeof status === 'string') {
      filtered = filtered.filter((w) => w.status === status)
    }
    if (projectId && typeof projectId === 'string') {
      filtered = filtered.filter((w) => w.project_id === projectId)
    }

    // Apply pagination
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum)

    return res.status(200).json({
      success: true,
      data: paginated,
    })
  } catch (error) {
    console.error('Error listing workflows:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list workflows',
      },
    })
  }
}
