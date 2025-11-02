import { fetchMetrics } from '@/features/aws/metrics/libs/fetchers'
import Metrics from '@/features/aws/metrics/Metrics'

export default async function MetricsPage() {
  const mockInstanceIds = ['i-0bbaac4d3a7cdad2f', 'i-0878ffbb474e7cd77', 'i-07335c016331bad7a']

  const res = await fetchMetrics(mockInstanceIds.join(','))
  if (!res.success) {
    throw new Error('Failed to fetch metrics')
  }

  return <Metrics data={res.data} />
}
