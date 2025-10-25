/**
 * 🦁 LionPack Studio - List Workflows API Route
 * GET /api/workflows
 *
 * NOTE: Disabled in Phase 2 - workflows API will be refactored
 */

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(503).json({
    error: 'Workflows API disabled during Phase 2 refactoring'
  })
}
