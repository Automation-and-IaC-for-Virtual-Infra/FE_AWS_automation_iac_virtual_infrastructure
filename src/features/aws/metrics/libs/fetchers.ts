import { toFrontendUrl } from '@/utils/url'

export const fetchMetrics = async (instanceIds: string) => {
  const res = await fetch(toFrontendUrl(`/api/aws/metric?instanceIds=${instanceIds}`))
  return res.json()
}
