import { fetchServices } from '@/features/aws/services/libs/fetchers'
import Dashboard from '@/features/dashboard/Dashboard'
import { fetchEstCostMonthly } from '@/features/dashboard/libs/fetchers'
import { getSessionNewest } from '@/features/infrastructure/setup/libs/fetchers'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const resNewestSession = await getSessionNewest()
  let estCostData = null
  if (resNewestSession?.session_id) {
    const resEstCost = await fetchEstCostMonthly(resNewestSession.session_id)
    if (resEstCost.success) {
      estCostData = resEstCost.results
    }
  }

  // list services
  const resServices = await fetchServices()

  return <Dashboard estCostData={estCostData} services={resServices?.items || []} />
}
