import { toBackendUrl } from '@/utils/api'

export const fetchMetrics = async (instanceIds: string) => {
  const res = await fetch(toBackendUrl(`/api/aws/metric?instanceIds=${instanceIds}`))
  return res.json()
}

export const listService = async () => {
  const res = await fetch('http://18.143.219.22:8001/list_services?page=1&page_size=20')
  return res.json()
}
