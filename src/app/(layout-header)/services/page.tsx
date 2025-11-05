import { fetchMetrics, fetchServices } from '@/features/aws/metrics/libs/fetchers'
import { filterServicesHasMetrics } from '@/features/aws/services/libs/utils'
import Services from '@/features/aws/services/Services'
import { Suspense } from 'react'

export default async function ServicesPage() {
  const resServices = await fetchServices()
  if (!resServices) {
    throw new Error('Failed to fetch services')
  }

  const servicesWithMetrics = filterServicesHasMetrics(resServices.items || [])
  const resMetrics = await fetchMetrics(servicesWithMetrics.map((s) => s.service_id).join(','))

  if (!resServices.items) {
    throw new Error('Failed to fetch services')
  }

  return (
    <Suspense>
      <Services services={resServices.items} metrics={resMetrics.data.MetricDataResults} />
    </Suspense>
  )
}
