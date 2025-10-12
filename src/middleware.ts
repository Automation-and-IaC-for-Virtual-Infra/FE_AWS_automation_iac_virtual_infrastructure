import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const idToken = req.cookies.get('idToken')?.value
  const url = req.nextUrl.clone()
  const listUnauthenticatedPaths = [
    '/login',
    '/register',
    '/confirm-registration',
    '/forgot-password',
    '/reset-password',
  ]

  if (!idToken && !listUnauthenticatedPaths.some((path) => url.pathname.startsWith(path))) {
    url.pathname = '/login'
    return Response.redirect(url)
  }

  if (idToken && listUnauthenticatedPaths.some((path) => url.pathname.startsWith(path))) {
    const verifyRes = await fetch(`${req.nextUrl.origin}/api/auth/verify-token`, {
      headers: { cookie: `idToken=${idToken}` },
    })
    const data = await verifyRes.json()
    if (data.success) {
      url.pathname = '/'
      return Response.redirect(url)
    }

    // If token is invalid, clear cookies and redirect to login
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.set('idToken', '', { maxAge: 0 })
    response.cookies.set('accessToken', '', { maxAge: 0 })
    response.cookies.set('refreshToken', '', { maxAge: 0 })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
