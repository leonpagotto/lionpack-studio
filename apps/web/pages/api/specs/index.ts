/**
 * 🦁 LionPack Studio - Specifications API Route
 * POST /api/specs - Create specification
 * GET /api/specs - List specifications
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import type { APIResponse } from '@leo-client/types'
import type { Specification } from '@leo-client/types'
import { SpecGenerator } from '@leo-client'

const specGenerator = new SpecGenerator()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<any>>
) {
  if (req.method === 'POST') {
    return handleCreateSpec(req, res)
  } else if (req.method === 'GET') {
    return handleListSpecs(req, res)
  } else {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Method ${req.method} not allowed. Use POST or GET.`,
      },
    })
  }
}

async function handleCreateSpec(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Specification>>
) {
  try {
    const { workflowId, description, model, includeArchitecture } = req.body

    // Validate input
    if (!workflowId || typeof workflowId !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WORKFLOW_ID',
          message: 'workflowId is required and must be a string',
        },
      })
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DESCRIPTION',
          message: 'description is required and must be a non-empty string',
        },
      })
    }

    // Generate specification using SpecGenerator
    const spec = await specGenerator.generateAndSave(workflowId, {
      description,
      model: model || undefined,
      includeArchitecture: includeArchitecture || false,
    })

    return res.status(201).json({
      success: true,
      data: spec,
    })
  } catch (error) {
    console.error('Error creating specification:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create specification',
      },
    })
  }
}

async function handleListSpecs(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Specification[]>>
) {
  try {
    const { workflowId, limit = '10', offset = '0' } = req.query

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
    //   .from('specifications')
    //   .select('*')
    //   .range(offsetNum, offsetNum + limitNum - 1)
    //   .order('created_at', { ascending: false })
    //
    // if (workflowId && typeof workflowId === 'string') {
    //   query.eq('workflow_id', workflowId)
    // }
    //
    // const { data: specs, error } = await query

    // Mock specifications data for Phase 1
    const mockSpecs: Specification[] = [
      {
        id: 'spec-1',
        workflow_id: 'workflow-1',
        title: 'OAuth2 Authentication System',
        description: 'Implement OAuth2 with Google and GitHub',
        acceptance_criteria: [
          'Support Google OAuth login',
          'Support GitHub OAuth login',
          'Maintain secure sessions',
        ],
        estimated_effort: '2 weeks',
        suggested_architecture: 'Modular auth middleware with JWT',
        model_used: 'sonnet',
        created_at: new Date(),
      },
    ]

    // Filter by workflow if specified
    let filtered = mockSpecs
    if (workflowId && typeof workflowId === 'string') {
      filtered = filtered.filter((s) => s.workflow_id === workflowId)
    }

    // Apply pagination
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum)

    return res.status(200).json({
      success: true,
      data: paginated,
    })
  } catch (error) {
    console.error('Error listing specifications:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to list specifications',
      },
    })
  }
}
