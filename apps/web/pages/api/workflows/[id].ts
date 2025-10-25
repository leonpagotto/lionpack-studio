/**
 * 🦁 LionPack Studio - Get Single Workflow API Route
 * GET /api/workflows/[id]
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { APIResponse } from '@leo-client/types'
import type { Workflow } from '@leo-client/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Workflow>>
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
    const { id } = req.query

    // Validate workflow ID
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WORKFLOW_ID',
          message: 'Workflow ID is required and must be a non-empty string',
        },
      })
    }

    // TODO: In production, fetch from Supabase
    // const { data: workflow, error } = await supabase
    //   .from('workflows')
    //   .select('*')
    //   .eq('id', id)
    //   .single()

    // Mock workflow data for Phase 1
    const mockWorkflow: Workflow = {
      id,
      project_id: 'project-123',
      title: 'Fetched Workflow',
      description: 'This is a fetched workflow',
      status: 'in-progress',
      created_at: new Date(),
      updated_at: new Date(),
    }

    return res.status(200).json({
      success: true,
      data: mockWorkflow,
    })
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch workflow',
      },
    })
  }
}
