/**
 * 🦁 LionPack Studio - Specification Generator
 *
 * Generates project specifications using LEO Kit's multi-model support
 */

import type { Specification } from './types'

export interface SpecGenerationRequest {
  description: string
  projectContext?: Record<string, unknown>
  model?: 'sonnet' | '4' | '4-5' | 'haiku'
  includeArchitecture?: boolean
}

export interface GeneratedSpec {
  title: string
  description: string
  acceptance_criteria: string[]
  estimated_effort: string
  suggested_architecture: string
  implementation_notes: string
  potential_risks: string[]
  model_used: string
}

export class SpecGenerator {
  private cache: Map<string, GeneratedSpec> = new Map()

  /**
   * Generate a specification from description
   * Uses multi-model orchestration via LEO Kit
   */
  async generate(request: SpecGenerationRequest): Promise<GeneratedSpec> {
    const model = request.model || this.getRecommendedModel(request.description)
    const cacheKey = `${request.description}-${model}`

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // Construct prompt for spec generation
      const prompt = this.buildGenerationPrompt(request, model)

      // Simulate multi-model orchestration
      // In production, this would call leo-workflow-kit's orchestrator
      const spec = await this.callModel(model, prompt)

      // Validate generated spec
      const validationResult = await this.validate(spec)
      if (!validationResult.valid) {
        console.warn(
          'Generated spec validation issues:',
          validationResult.issues
        )
        // In production, could retry with different model or refine
      }

      // Cache result
      this.cache.set(cacheKey, spec)

      return spec
    } catch (error) {
      throw new Error(
        `Failed to generate specification: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Generate specification and save to database
   * Returns Specification type for database storage
   */
  async generateAndSave(
    workflowId: string,
    request: SpecGenerationRequest
  ): Promise<Specification> {
    const generatedSpec = await this.generate(request)

    // Transform to Specification type for storage
    const specification: Specification = {
      id: `spec-${Date.now()}`,
      workflow_id: workflowId,
      title: generatedSpec.title,
      description: generatedSpec.description,
      acceptance_criteria: generatedSpec.acceptance_criteria,
      estimated_effort: generatedSpec.estimated_effort,
      suggested_architecture: generatedSpec.suggested_architecture,
      model_used: generatedSpec.model_used as 'sonnet' | '4' | '4-5' | 'haiku',
      created_at: new Date(),
    }

    // In production, would call database save here
    // await database.specifications.create(specification);

    return specification
  }

  /**
   * Refine an existing specification based on feedback
   * Uses model to improve spec based on provided feedback
   */
  async refine(
    specId: string,
    feedback: string,
    model?: 'sonnet' | '4' | '4-5' | 'haiku'
  ): Promise<GeneratedSpec> {
    if (!feedback || feedback.trim().length === 0) {
      throw new Error('Feedback cannot be empty')
    }

    try {
      // In production, would fetch existing spec from database
      // const existingSpec = await database.specifications.findById(specId);

      const refinementModel = model || 'sonnet'
      const prompt = this.buildRefinementPrompt(specId, feedback)

      const refinedSpec = await this.callModel(refinementModel, prompt)

      // Update cache with refined version
      const cacheKey = `${refinedSpec.description}-${refinementModel}`
      this.cache.set(cacheKey, refinedSpec)

      return refinedSpec
    } catch (error) {
      throw new Error(
        `Failed to refine specification: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validate specification against acceptance criteria
   * Checks for completeness and consistency
   */
  async validate(spec: GeneratedSpec): Promise<{
    valid: boolean
    issues: string[]
  }> {
    const issues: string[] = []

    // Check required fields
    if (!spec.title || spec.title.trim().length === 0) {
      issues.push('Title is required and cannot be empty')
    }

    if (!spec.description || spec.description.trim().length === 0) {
      issues.push('Description is required and cannot be empty')
    }

    // Check acceptance criteria
    if (
      !spec.acceptance_criteria ||
      spec.acceptance_criteria.length === 0
    ) {
      issues.push('At least one acceptance criterion is required')
    } else if (spec.acceptance_criteria.length < 3) {
      issues.push(
        'Recommendation: Include at least 3 acceptance criteria for clarity'
      )
    }

    // Validate acceptance criteria format
    const invalidCriteria = spec.acceptance_criteria.filter(
      (criterion) => !criterion || criterion.trim().length === 0
    )
    if (invalidCriteria.length > 0) {
      issues.push('All acceptance criteria must be non-empty strings')
    }

    // Check estimated effort
    if (!spec.estimated_effort || spec.estimated_effort.trim().length === 0) {
      issues.push('Estimated effort is required')
    }

    const validEffortValues = [
      '1-3 days',
      '1 week',
      '2 weeks',
      '3-4 weeks',
      '1-2 months',
      '2+ months',
    ]
    if (
      spec.estimated_effort &&
      !validEffortValues.includes(spec.estimated_effort)
    ) {
      issues.push(
        `Invalid effort value. Use one of: ${validEffortValues.join(', ')}`
      )
    }

    // Check architecture suggestion
    if (
      !spec.suggested_architecture ||
      spec.suggested_architecture.trim().length === 0
    ) {
      issues.push('Suggested architecture is required')
    }

    // Check implementation notes
    if (
      !spec.implementation_notes ||
      spec.implementation_notes.trim().length === 0
    ) {
      issues.push('Implementation notes are required')
    }

    // Check potential risks
    if (!spec.potential_risks || spec.potential_risks.length === 0) {
      issues.push('At least one potential risk should be identified')
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }

  /**
   * Get recommended model based on complexity analysis
   * Uses heuristic to select most appropriate model
   */
  getRecommendedModel(
    description: string
  ): 'sonnet' | '4' | '4-5' | 'haiku' {
    if (!description || description.trim().length === 0) {
      return 'sonnet' // Default
    }

    const wordCount = description.split(/\s+/).length
    const complexity = this.analyzeComplexity(description)

    // Model selection heuristic:
    // - Simple tasks (< 50 words, low complexity) → haiku (fast, efficient)
    // - Moderate tasks (50-200 words, medium complexity) → sonnet (balanced)
    // - Complex tasks (> 200 words, high complexity) → 4 (powerful)
    // - Very complex (architectural decisions, multiple systems) → 4-5 (best)

    if (wordCount < 50 && complexity === 'low') {
      return 'haiku'
    }

    if (wordCount < 200 && complexity === 'low') {
      return 'sonnet'
    }

    if (wordCount > 200 && complexity === 'high') {
      return '4'
    }

    if (complexity === 'very-high' || wordCount > 500) {
      return '4-5'
    }

    // Default for moderate cases
    return 'sonnet'
  }

  /**
   * Analyze complexity level based on description keywords
   */
  private analyzeComplexity(
    description: string
  ): 'low' | 'medium' | 'high' | 'very-high' {
    const lowerDesc = description.toLowerCase()

    // Complex indicators
    const highComplexityKeywords = [
      'architecture',
      'database',
      'performance',
      'security',
      'oauth',
      'deployment',
      'kubernetes',
      'microservices',
      'distributed',
    ]
    const veryHighKeywords = [
      'refactor',
      'migration',
      'multi-system',
      'integration',
    ]

    const veryHighCount = veryHighKeywords.filter((kw) =>
      lowerDesc.includes(kw)
    ).length
    const highCount = highComplexityKeywords.filter((kw) =>
      lowerDesc.includes(kw)
    ).length

    if (veryHighCount > 0) return 'very-high'
    if (highCount >= 2) return 'high'
    if (highCount >= 1) return 'medium'
    return 'low'
  }

  /**
   * Build prompt for specification generation
   */
  private buildGenerationPrompt(
    request: SpecGenerationRequest,
    model: string
  ): string {
    return `
You are a technical specification expert. Generate a comprehensive project specification based on this description:

Description: ${request.description}

${request.projectContext ? `Project Context: ${JSON.stringify(request.projectContext)}` : ''}

Please provide:
1. A clear, concise title
2. Detailed description
3. At least 3 acceptance criteria
4. Estimated effort (1-3 days, 1 week, 2 weeks, 3-4 weeks, 1-2 months, or 2+ months)
5. Suggested architecture/approach
6. Implementation notes and considerations
7. Potential risks and mitigation strategies

${request.includeArchitecture ? '8. Include a suggested system architecture' : ''}

Format as JSON with fields: title, description, acceptance_criteria (array), estimated_effort, suggested_architecture, implementation_notes, potential_risks (array), model_used.
Use model: ${model}
`.trim()
  }

  /**
   * Build prompt for specification refinement
   */
  private buildRefinementPrompt(specId: string, feedback: string): string {
    return `
You are a technical specification expert. Refine the specification with ID ${specId} based on the following feedback:

Feedback: ${feedback}

Please improve the specification by addressing the feedback while maintaining clarity and completeness.
Return the refined specification in JSON format.
`.trim()
  }

  /**
   * Call model for text generation (simulated)
   * In production, would call leo-workflow-kit orchestrator
   */
  private async callModel(
    model: string,
    prompt: string
  ): Promise<GeneratedSpec> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Simulate generated specification
    const spec: GeneratedSpec = {
      title: 'Generated Specification',
      description: prompt.substring(0, 100) + '...',
      acceptance_criteria: [
        'System must meet all specified requirements',
        'Code must have 80%+ test coverage',
        'Documentation must be complete and accurate',
      ],
      estimated_effort: this.estimateEffort(prompt),
      suggested_architecture: 'Modular architecture with clear separation of concerns',
      implementation_notes:
        'Follow established patterns and best practices. Ensure backward compatibility.',
      potential_risks: [
        'Integration complexity with existing systems',
        'Performance considerations under load',
      ],
      model_used: model,
    }

    return spec
  }

  /**
   * Estimate effort based on prompt complexity
   */
  private estimateEffort(prompt: string): string {
    const wordCount = prompt.split(/\s+/).length

    if (wordCount < 50) return '1-3 days'
    if (wordCount < 150) return '1 week'
    if (wordCount < 300) return '2 weeks'
    if (wordCount < 500) return '3-4 weeks'
    if (wordCount < 1000) return '1-2 months'
    return '2+ months'
  }
}
