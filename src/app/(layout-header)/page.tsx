import { createPageTitle, PAGE_TITLES } from '@/constants/route'
import { fetchServices } from '@/features/aws/services/libs/fetchers'
import Dashboard from '@/features/dashboard/Dashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: createPageTitle(PAGE_TITLES.DASHBOARD),
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // list services
  const resServices = await fetchServices()

  return <Dashboard services={resServices?.items || []} />
}
