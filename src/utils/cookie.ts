import { ENV } from '@/constants/env'
import { cookies } from 'next/headers'

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

export const setCookie = async (name: string, value: string, options: Record<string, any>) => {
  const cookieStore = await cookies()
  cookieStore.set(name, value, options)
}

export const deleteCookie = async (name: string) => {
  const cookieStore = await cookies()
  cookieStore.delete(name)
}

export const getCookie = async (name: string): Promise<string | undefined> => {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(name)
  return cookie?.value
}
