import { createPageTitle, PAGE_TITLES } from '@/constants/route'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: createPageTitle(PAGE_TITLES.ACCOUNT_SETTINGS),
}

export default function AccountSettingsPage() {
  return <div>Account Settings Page</div>
}
