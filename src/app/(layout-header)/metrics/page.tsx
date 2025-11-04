import { fetchMetrics, listService } from '@/features/aws/metrics/libs/fetchers'
import Metrics from '@/features/aws/metrics/Metrics'

export default async function MetricsPage() {
  console.log('📌 MetricsPage start')

  // 1. call listService để lấy danh sách service
  const serviceRes = await listService()

  // 2. extract instanceId từ service
  const instanceIds = serviceRes.services
    .map((s: any) => s.service_id) // tùy theo response BE trả về, nếu key khác thì chỉnh
    .filter(Boolean)

  console.log(instanceIds, 'serviceRes')
  if (!instanceIds.length) {
    throw new Error('Không có instanceId hợp lệ trong danh sách service')
  }

  // 3. gọi metrics bằng instanceIds lấy được
  const metricRes = await fetchMetrics(instanceIds.join(','))
  console.log('📌 Metric response:', metricRes)

  if (!metricRes.success) {
    throw new Error('Failed to fetch metrics')
  }

  return <Metrics data={metricRes.data.MetricDataResults} />
}
