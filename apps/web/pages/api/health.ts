/**
 * Health Check API Endpoint
 *
 * Verifies the API is running and can respond to requests.
 */

import type { NextApiRequest, NextApiResponse } from 'next'

type HealthResponse = {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    })
    return
  }

  // Return healthy status
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  })
}
