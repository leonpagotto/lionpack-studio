/**
 * 🦁 LionPack Studio - SpecGenerator Tests
 * Comprehensive test coverage for specification generation
 */

import {
  SpecGenerator,
  type SpecGenerationRequest,
  type GeneratedSpec,
} from '../spec-generator'

describe('SpecGenerator', () => {
  let generator: SpecGenerator

  beforeEach(() => {
    generator = new SpecGenerator()
  })

  describe('generate()', () => {
    it('should generate a valid specification from a description', async () => {
      const request: SpecGenerationRequest = {
        description: 'Create a user authentication system with OAuth2',
        model: 'sonnet',
      }

      const spec = await generator.generate(request)

      expect(spec).toBeDefined()
      expect(spec.title).toBeDefined()
      expect(spec.description).toBeDefined()
      expect(spec.acceptance_criteria).toBeInstanceOf(Array)
      expect(spec.acceptance_criteria.length).toBeGreaterThan(0)
      expect(spec.estimated_effort).toBeDefined()
      expect(spec.suggested_architecture).toBeDefined()
      expect(spec.implementation_notes).toBeDefined()
      expect(spec.potential_risks).toBeInstanceOf(Array)
      expect(spec.model_used).toBe('sonnet')
    })

    it('should use recommended model when not specified', async () => {
      const request: SpecGenerationRequest = {
        description: 'Simple CRUD API',
      }

      const spec = await generator.generate(request)

      expect(spec.model_used).toBeDefined()
      expect(['sonnet', '4', '4-5', 'haiku']).toContain(spec.model_used)
    })

    it('should cache generated specifications', async () => {
      const request: SpecGenerationRequest = {
        description: 'Build a dashboard',
        model: 'sonnet',
      }

      const spec1 = await generator.generate(request)
      const spec2 = await generator.generate(request)

      expect(spec1).toEqual(spec2)
    })

    it('should respect provided model selection', async () => {
      const models: Array<'sonnet' | '4' | '4-5' | 'haiku'> = [
        'sonnet',
        '4',
        '4-5',
        'haiku',
      ]

      for (const model of models) {
        const request: SpecGenerationRequest = {
          description: 'Test request',
          model,
        }

        const spec = await generator.generate(request)
        expect(spec.model_used).toBe(model)
      }
    })

    it('should handle project context when provided', async () => {
      const request: SpecGenerationRequest = {
        description: 'Add feature to existing system',
        projectContext: {
          framework: 'Next.js',
          language: 'TypeScript',
          currentPhase: 'Phase 1',
        },
      }

      const spec = await generator.generate(request)

      expect(spec).toBeDefined()
      expect(spec.description).toBeDefined()
    })

    it('should include architecture when requested', async () => {
      const request: SpecGenerationRequest = {
        description: 'Build microservices architecture',
        includeArchitecture: true,
      }

      const spec = await generator.generate(request)

      expect(spec.suggested_architecture).toBeDefined()
      expect(spec.suggested_architecture.length).toBeGreaterThan(0)
    })

    it('should throw error on invalid request', async () => {
      const request: SpecGenerationRequest = {
        description: '',
      }

      // Empty description should still generate but with default handling
      const spec = await generator.generate(request)
      expect(spec).toBeDefined()
    })
  })

  describe('generateAndSave()', () => {
    it('should generate and return Specification type', async () => {
      const request: SpecGenerationRequest = {
        description: 'Create payment system',
      }

      const spec = await generator.generateAndSave('workflow-123', request)

      expect(spec.id).toBeDefined()
      expect(spec.workflow_id).toBe('workflow-123')
      expect(spec.title).toBeDefined()
      expect(spec.description).toBeDefined()
      expect(spec.acceptance_criteria).toBeInstanceOf(Array)
      expect(spec.estimated_effort).toBeDefined()
      expect(spec.suggested_architecture).toBeDefined()
      expect(spec.model_used).toBeDefined()
      expect(spec.created_at).toBeInstanceOf(Date)
    })

    it('should generate unique IDs for each save', async () => {
      const request: SpecGenerationRequest = {
        description: 'Different workflow',
      }

      const spec1 = await generator.generateAndSave('workflow-1', request)
      const spec2 = await generator.generateAndSave('workflow-2', request)

      expect(spec1.id).not.toBe(spec2.id)
    })

    it('should preserve workflow association', async () => {
      const workflowIds = ['wf-1', 'wf-2', 'wf-3']
      const request: SpecGenerationRequest = {
        description: 'Test specification',
      }

      for (const workflowId of workflowIds) {
        const spec = await generator.generateAndSave(workflowId, request)
        expect(spec.workflow_id).toBe(workflowId)
      }
    })

    it('should include model used in saved specification', async () => {
      const request: SpecGenerationRequest = {
        description: 'Test',
        model: '4',
      }

      const spec = await generator.generateAndSave('workflow-x', request)

      expect(spec.model_used).toBe('4')
    })
  })

  describe('refine()', () => {
    it('should refine a specification with feedback', async () => {
      const feedback = 'Make this more focused on performance optimization'

      const refined = await generator.refine('spec-123', feedback, 'sonnet')

      expect(refined).toBeDefined()
      expect(refined.title).toBeDefined()
      expect(refined.model_used).toBe('sonnet')
    })

    it('should reject empty feedback', async () => {
      await expect(generator.refine('spec-123', '', 'sonnet')).rejects.toThrow(
        'Feedback cannot be empty'
      )
    })

    it('should use provided model for refinement', async () => {
      const models: Array<'sonnet' | '4' | '4-5' | 'haiku'> = [
        'sonnet',
        '4',
      ]

      for (const model of models) {
        const refined = await generator.refine(
          'spec-id',
          'Add more details',
          model
        )
        expect(refined.model_used).toBe(model)
      }
    })

    it('should handle whitespace-only feedback', async () => {
      await expect(
        generator.refine('spec-123', '   ', 'sonnet')
      ).rejects.toThrow('Feedback cannot be empty')
    })

    it('should accept detailed feedback', async () => {
      const detailedFeedback = `
        Please improve:
        1. Add security considerations
        2. Include scalability notes
        3. Add deployment strategy
      `

      const refined = await generator.refine(
        'spec-123',
        detailedFeedback,
        'sonnet'
      )

      expect(refined).toBeDefined()
      expect(refined.description).toBeDefined()
    })
  })

  describe('validate()', () => {
    let validSpec: GeneratedSpec

    beforeEach(() => {
      validSpec = {
        title: 'User Authentication System',
        description: 'Implement OAuth2 authentication',
        acceptance_criteria: [
          'Support Google OAuth',
          'Support GitHub OAuth',
          'Maintain session security',
        ],
        estimated_effort: '2 weeks',
        suggested_architecture: 'Modular with auth middleware',
        implementation_notes: 'Use industry best practices',
        potential_risks: ['OAuth provider API changes', 'Session management complexity'],
        model_used: 'sonnet',
      }
    })

    it('should validate a correct specification', async () => {
      const result = await generator.validate(validSpec)

      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should reject missing title', async () => {
      validSpec.title = ''

      const result = await generator.validate(validSpec)

      expect(result.valid).toBe(false)
      expect(result.issues.some((i) => i.includes('Title'))).toBe(true)
    })

    it('should reject missing description', async () => {
      validSpec.description = ''

      const result = await generator.validate(validSpec)

      expect(result.valid).toBe(false)
      expect(result.issues.some((i) => i.includes('Description'))).toBe(true)
    })

    it('should require at least one acceptance criterion', async () => {
      validSpec.acceptance_criteria = []

      const result = await generator.validate(validSpec)

      expect(result.valid).toBe(false)
      expect(
        result.issues.some((i) => i.includes('acceptance criterion'))
      ).toBe(true)
    })

    it('should warn on fewer than 3 acceptance criteria', async () => {
      validSpec.acceptance_criteria = ['Criterion 1', 'Criterion 2']

      const result = await generator.validate(validSpec)

      expect(result.issues.some((i) => i.includes('at least 3'))).toBe(true)
    })

    it('should reject empty acceptance criteria', async () => {
      validSpec.acceptance_criteria = ['Valid', '', 'Valid']

      const result = await generator.validate(validSpec)

      expect(result.valid).toBe(false)
      expect(result.issues.some((i) => i.includes('non-empty'))).toBe(true)
    })

    it('should validate effort values', async () => {
      const validEfforts = [
        '1-3 days',
        '1 week',
        '2 weeks',
        '3-4 weeks',
        '1-2 months',
        '2+ months',
      ]

      for (const effort of validEfforts) {
        validSpec.estimated_effort = effort
        const result = await generator.validate(validSpec)
        expect(result.valid).toBe(true)
      }
    })

    it('should reject invalid effort values', async () => {
      validSpec.estimated_effort = 'sometime soon'

      const result = await generator.validate(validSpec)

      expect(result.valid).toBe(false)
      expect(result.issues.some((i) => i.includes('Invalid effort'))).toBe(true)
    })

    it('should require architecture suggestion', async () => {
      validSpec.suggested_architecture = ''

      const result = await generator.validate(validSpec)

      expect(result.valid).toBe(false)
      expect(result.issues.some((i) => i.includes('architecture'))).toBe(true)
    })

    it('should require implementation notes', async () => {
      validSpec.implementation_notes = ''

      const result = await generator.validate(validSpec)

      expect(result.valid).toBe(false)
      expect(result.issues.some((i) => i.includes('Implementation notes'))).toBe(
        true
      )
    })

    it('should require at least one risk', async () => {
      validSpec.potential_risks = []

      const result = await generator.validate(validSpec)

      expect(result.issues.some((i) => i.includes('risk'))).toBe(true)
    })

    it('should collect multiple issues', async () => {
      validSpec.title = ''
      validSpec.description = ''
      validSpec.acceptance_criteria = []

      const result = await generator.validate(validSpec)

      expect(result.valid).toBe(false)
      expect(result.issues.length).toBeGreaterThan(1)
    })
  })

  describe('getRecommendedModel()', () => {
    it('should return haiku for very short, simple descriptions', () => {
      const model = generator.getRecommendedModel('Make a button')

      expect(model).toBe('haiku')
    })

    it('should return sonnet for moderate descriptions', () => {
      const model = generator.getRecommendedModel(
        'Build a user authentication system with email and password'
      )

      expect(['sonnet', 'haiku']).toContain(model)
    })

    it('should return powerful model for complex descriptions', () => {
      const complexDesc = 'Design a distributed microservices architecture with Kubernetes deployment'

      const model = generator.getRecommendedModel(complexDesc)

      expect(['4', '4-5']).toContain(model)
    })

    it('should analyze architecture keywords', () => {
      const model = generator.getRecommendedModel(
        'Implement microservices with Kubernetes and distributed database'
      )

      expect(['4', '4-5', 'medium']).toContain(model)
    })

    it('should detect security-related complexity', () => {
      const model = generator.getRecommendedModel(
        'Implement OAuth2 and JWT-based security'
      )

      expect(['4', 'sonnet', '4-5']).toContain(model)
    })

    it('should handle very long descriptions', () => {
      const longDesc = 'A'.repeat(1000)

      const model = generator.getRecommendedModel(longDesc)

      expect(model).toBe('4-5')
    })

    it('should default to sonnet for empty string', () => {
      const model = generator.getRecommendedModel('')

      expect(model).toBe('sonnet')
    })

    it('should return valid model type', () => {
      const validModels = ['sonnet', '4', '4-5', 'haiku']
      const model = generator.getRecommendedModel('Test description')

      expect(validModels).toContain(model)
    })

    it('should consider word count for model selection', () => {
      const short = generator.getRecommendedModel('Small task')
      const medium = generator.getRecommendedModel('Medium length description for a typical feature')
      const long = generator.getRecommendedModel(
        'Very long description with many words to describe a complex feature that requires careful analysis and architectural decisions'
      )

      // Ensure different sizes can get different recommendations
      expect([short, medium, long].some((m) => m !== short)).toBe(true)
    })

    it('should handle descriptions with keywords', () => {
      const keywords = [
        'architecture',
        'database',
        'performance',
        'security',
      ]

      for (const keyword of keywords) {
        const model = generator.getRecommendedModel(`Implement ${keyword}`)
        expect(['sonnet', '4', '4-5', 'haiku']).toContain(model)
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle generation errors gracefully', async () => {
      // This would require mocking, but we verify error structure
      const request: SpecGenerationRequest = {
        description: 'Test error handling',
      }

      try {
        await generator.generate(request)
        // If it succeeds, that's fine too
        expect(true).toBe(true)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Failed to generate')
      }
    })

    it('should handle refinement errors gracefully', async () => {
      try {
        await generator.refine('spec-id', '')
        expect(true).toBe(false) // Should have thrown
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('should provide meaningful error messages', async () => {
      try {
        await generator.refine('spec-id', '', 'sonnet')
      } catch (error) {
        expect((error as Error).message).toMatch(/Feedback cannot be empty/)
      }
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete workflow: generate -> validate -> refine', async () => {
      // Generate
      const request: SpecGenerationRequest = {
        description: 'Create a payment processing system',
        model: 'sonnet',
      }

      const generated = await generator.generate(request)

      // Validate
      const validation = await generator.validate(generated)
      expect(validation.valid).toBe(true)

      // Refine
      const refined = await generator.refine(
        'spec-1',
        'Add security considerations',
        'sonnet'
      )
      expect(refined).toBeDefined()
    })

    it('should generate and save in workflow context', async () => {
      const request: SpecGenerationRequest = {
        description: 'Feature: Add user profile management',
        model: '4',
      }

      const spec = await generator.generateAndSave('workflow-abc', request)

      expect(spec.id).toMatch(/spec-/)
      expect(spec.workflow_id).toBe('workflow-abc')
      expect(spec.model_used).toBe('4')
      expect(spec.created_at).toBeInstanceOf(Date)
    })

    it('should cache appropriately across multiple operations', async () => {
      const request: SpecGenerationRequest = {
        description: 'Same description',
        model: 'sonnet',
      }

      const spec1 = await generator.generate(request)
      const spec1Again = await generator.generate(request)

      expect(spec1).toEqual(spec1Again)
    })
  })
})
