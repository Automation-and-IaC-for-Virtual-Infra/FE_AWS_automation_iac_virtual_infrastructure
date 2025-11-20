import { ENV } from '@/constants/env'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      wsBaseUrl: ENV.WS_BACKEND_SERVER_URL || 'ws://localhost:8001',
      apiBaseUrl: ENV.BACKEND_SERVER_URL || 'http://localhost:8001',
    })
  } catch (error) {
    console.error('Error fetching WebSocket config:', error)
    return NextResponse.json({ error: 'Failed to fetch WebSocket configuration' }, { status: 500 })
  }
}
