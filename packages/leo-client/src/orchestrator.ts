/**
 * 🦁 LionPack Studio - Orchestrator
 *
 * Wraps LEO Kit's multi-agent orchestration system, providing
 * a convenient interface for workflow routing and execution.
 */

// TODO: Install leo-workflow-kit package
// import { Orchestrator as LEOOrchestrator } from 'leo-workflow-kit'

// Temporary stub until leo-workflow-kit is installed
class LEOOrchestratorStub {
  constructor(_config: any) {}
  analyzeTask(_input: string): any { return {}; }
  routeToAgents(_decision: any): any { return {}; }
  generateSpec(_input: string, _options?: any): any { return {}; }
  classify(_request: any): any { return {}; }
  executeWorkflow(_options: any): any { return {}; }
  getWorkflow(_id: string): any { return {}; }
}
const LEOOrchestrator = LEOOrchestratorStub;

export interface OrchestratorConfig {
  modelPreference?: 'sonnet' | '4' | '4-5' | 'haiku'
  githubToken: string
  anthropicKey: string
  autoSelectModels?: boolean
}

export interface RoutingDecision {
  taskType: 'frontend' | 'backend' | 'devops' | 'testing' | 'docs' | 'multi'
  agents: string[]
  complexity: 'simple' | 'moderate' | 'complex'
  estimatedEffort: string
}

export interface WorkflowSpec {
  title: string
  description: string
  acceptanceCriteria: string[]
  estimatedEffort: string
  suggestedArchitecture: string
  model: string
}

export interface WorkflowResult {
  id: string
  issueNumber: number
  issueUrl: string
  spec: WorkflowSpec
  agents: string[]
  status: 'in-progress' | 'completed' | 'blocked'
  createdAt: Date
}

/**
 * Orchestrator class wraps LEO Kit functionality
 * for use within LionPack Studio
 */
export class Orchestrator {
  private leo: InstanceType<typeof LEOOrchestrator>
  private config: OrchestratorConfig

  constructor(config: OrchestratorConfig) {
    this.config = config

    // Initialize LEO Kit orchestrator
    this.leo = new LEOOrchestrator({
      modelPreference: config.modelPreference || 'sonnet',
      githubToken: config.githubToken,
      anthropicKey: config.anthropicKey,
      autoSelectModels: config.autoSelectModels !== false,
    })
  }

  /**
   * Analyze a user request and determine routing
   * @param request The user's request or description
   * @returns Routing decision with task type and agents
   */
  async analyzeRequest(request: string): Promise<RoutingDecision> {
    try {
      const decision = await this.leo.classify(request)

      return {
        taskType: decision.type,
        agents: decision.agents,
        complexity: decision.complexity,
        estimatedEffort: decision.estimatedEffort,
      }
    } catch (error) {
      console.error('Error analyzing request:', error)
      throw error
    }
  }

  /**
   * Create a workflow based on specification
   * @param spec The workflow specification
   * @returns Created workflow with GitHub issue details
   */
  async createWorkflow(spec: {
    title: string
    description: string
    model?: string
    sourceContext?: Record<string, unknown>
  }): Promise<WorkflowResult> {
    try {
      const result = await this.leo.executeWorkflow({
        title: spec.title,
        description: spec.description,
        model: spec.model || this.config.modelPreference,
      })

      return {
        id: result.workflowId || `workflow-${Date.now()}`,
        issueNumber: result.issueNumber,
        issueUrl: result.issueUrl,
        spec: {
          title: spec.title,
          description: spec.description,
          acceptanceCriteria: result.acceptanceCriteria || [],
          estimatedEffort: result.estimatedEffort || 'TBD',
          suggestedArchitecture: result.suggestedArchitecture || '',
          model: spec.model || this.config.modelPreference || 'sonnet',
        },
        agents: result.assignedAgents || [],
        status: 'in-progress',
        createdAt: new Date(),
      }
    } catch (error) {
      console.error('Error creating workflow:', error)
      throw error
    }
  }

  /**
   * Generate a specification for a feature/task
   * @param description The feature description
   * @param model Which Claude model to use
   * @returns Generated specification
   */
  async generateSpec(
    description: string,
    model: 'sonnet' | '4' | '4-5' | 'haiku' = 'sonnet'
  ): Promise<WorkflowSpec> {
    try {
      const spec = await this.leo.generateSpec(description, {
        model,
      })

      return {
        title: spec.title,
        description: spec.description,
        acceptanceCriteria: spec.acceptanceCriteria || [],
        estimatedEffort: spec.estimatedEffort || 'TBD',
        suggestedArchitecture: spec.suggestedArchitecture || '',
        model,
      }
    } catch (error) {
      console.error('Error generating spec:', error)
      throw error
    }
  }

  /**
   * Get workflow status
   * @param workflowId The workflow ID
   * @returns Current workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<WorkflowResult | null> {
    try {
      const workflow = await this.leo.getWorkflow(workflowId)
      if (!workflow) return null

      return {
        id: workflow.id,
        issueNumber: workflow.issueNumber,
        issueUrl: workflow.issueUrl,
        spec: {
          title: workflow.title,
          description: workflow.description,
          acceptanceCriteria: workflow.acceptanceCriteria || [],
          estimatedEffort: workflow.estimatedEffort || 'TBD',
          suggestedArchitecture: workflow.suggestedArchitecture || '',
          model: 'sonnet', // Default model
        },
        agents: workflow.assignedAgents || [],
        status: workflow.status || 'in-progress',
        createdAt: new Date(workflow.createdAt),
      }
    } catch (error) {
      console.error('Error getting workflow status:', error)
      return null
    }
  }

  /**
   * List all available models
   */
  getAvailableModels() {
    return ['sonnet', '4', '4-5', 'haiku']
  }

  /**
   * Get orchestrator status/health check
   */
  async getStatus(): Promise<{
    ready: boolean
    defaultModel: string
    models: string[]
  }> {
    return {
      ready: true,
      defaultModel: this.config.modelPreference || 'sonnet',
      models: this.getAvailableModels(),
    }
  }
}
