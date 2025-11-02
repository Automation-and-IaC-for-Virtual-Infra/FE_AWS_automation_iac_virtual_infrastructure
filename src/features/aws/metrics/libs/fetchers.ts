import { toBackendUrl } from '@/utils/api'

export const fetchMetrics = async (instanceId: string) => {
  const res = await fetch(toBackendUrl(`/api/aws/metric?instanceIds=${instanceId}`))
  return res.json()
}
