import { COMMON_API } from '@/constants/api'
import { ENV } from '@/constants/env'
import { toBackendUrl } from '@/utils/url'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, session_id = '' } = body

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const url = toBackendUrl(COMMON_API.CHAT)
    console.log('🚀 ~ POST chat ~ url:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ENV.BACKEND_API_KEY,
      },
      body: JSON.stringify({ prompt, session_id }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return Response.json(
        { error: `Backend error: ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type')

    // Handle streaming response
    if (contentType?.includes('text/event-stream') || contentType?.includes('text/plain')) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Handle JSON response
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('❌ Chat API error:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// export const runtime = 'edge'
export const dynamic = 'force-dynamic'
