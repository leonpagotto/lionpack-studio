/**
 * Professional Workflow Demo Page
 *
 * Route: /demo/professional-workflow
 *
 * This page demonstrates the Story 3.9 integrated demo combining:
 * - Morphic chat interface (left side)
 * - Kilo Code split-panel editor (right side)
 *
 * Architecture Overview:
 * - Left 40%: Chat interface for code generation prompts
 * - Right 60%: Split-panel code editor
 *   - Top-left: File tree
 *   - Top-right: Code editor
 *   - Bottom: Terminal and test results
 */

import { ProfessionalWorkflow } from '@/components/ProfessionalWorkflow'

export default function ProfessionalWorkflowPage() {
  return <ProfessionalWorkflow />
}
