import { createPageTitle, PAGE_TITLES } from '@/constants/route'
import Login from '@/features/auth/Login'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: createPageTitle(PAGE_TITLES.LOGIN),
}

export default function LoginPage() {
  return <Login />
}
