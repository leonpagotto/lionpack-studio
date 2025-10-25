/**
 * 🦁 LionPack Studio - Specifications API Route
 * POST /api/specs - Create specification
 * GET /api/specs - List specifications
 *
 * NOTE: Disabled in Phase 2 - specs API will be refactored
 */

import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(503).json({
    error: 'Specs API disabled during Phase 2 refactoring'
  })
}
