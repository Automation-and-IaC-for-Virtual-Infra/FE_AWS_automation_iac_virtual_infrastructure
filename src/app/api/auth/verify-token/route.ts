import { verifyTokenAction } from '@/features/auth/lib/actions'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const idToken = cookieHeader
    .split(';')
    .find((c) => c.trim().startsWith('idToken='))
    ?.split('=')[1]

  const result = await verifyTokenAction(idToken || '')
  return NextResponse.json(result)
}
