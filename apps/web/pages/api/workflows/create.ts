/**
 * POST /api/workflows/create
 *
 * Creates a new workflow by analyzing the request and generating
 * a GitHub issue with LEO Kit orchestration.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { Orchestrator } from '@leo-client/orchestrator'

type CreateWorkflowRequest = {
  title: string
  description: string
  model?: 'sonnet' | '4' | '4-5' | 'haiku'
}

type CreateWorkflowResponse = {
  success: boolean
  data?: {
    workflowId: string
    issueNumber: number
    issueUrl: string
    agents: string[]
    estimatedEffort: string
    taskType: string
    complexity: string
  }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateWorkflowResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    })
  }

  try {
    // Validate request body
    const { title, description, model } = req.body as CreateWorkflowRequest

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title and description',
      })
    }

    // Validate title and description length
    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        error: 'Title must be less than 200 characters',
      })
    }

    if (description.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Description must be less than 5000 characters',
      })
    }

    // Check environment variables
    const githubToken = process.env.LEO_GITHUB_TOKEN
    const anthropicKey = process.env.LEO_ANTHROPIC_KEY

    if (!githubToken || !anthropicKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing required environment variables. Check .env.local',
      })
    }

    // Create orchestrator instance
    const orchestrator = new Orchestrator({
      githubToken,
      anthropicKey,
      modelPreference: model || 'sonnet',
      autoSelectModels: true,
    })

    // Step 1: Analyze the request
    const routing = await orchestrator.analyzeRequest(description)

    // Step 2: Create the workflow
    const workflow = await orchestrator.createWorkflow({
      title,
      description,
      model: model || 'sonnet',
    })

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        workflowId: workflow.id,
        issueNumber: workflow.issueNumber,
        issueUrl: workflow.issueUrl,
        agents: workflow.agents,
        estimatedEffort: workflow.spec.estimatedEffort,
        taskType: routing.taskType,
        complexity: routing.complexity,
      },
    })
  } catch (error) {
    console.error('Error creating workflow:', error)

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
}
