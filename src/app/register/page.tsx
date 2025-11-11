import { createPageTitle, PAGE_TITLES } from '@/constants/route'
import Register from '@/features/auth/Register'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: createPageTitle(PAGE_TITLES.REGISTER),
}

export default function RegisterPage() {
  return <Register />
}
