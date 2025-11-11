import { createPageTitle, PAGE_TITLES } from '@/constants/route'
import NewPasswordRequired from '@/features/auth/NewPasswordRequired'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: createPageTitle(PAGE_TITLES.NEW_PASSWORD_REQUIRED),
}

export default function NewPasswordRequirePage() {
  return <NewPasswordRequired />
}
