import { toBackendUrl, toFrontendUrl } from '@/utils/api'
import { ServiceData } from '../../services/libs/types'

export const fetchMetrics = async (instanceIds: string) => {
  const res = await fetch(toFrontendUrl(`/api/aws/metric?instanceIds=${instanceIds}`))
  return res.json()
}

export const fetchServices = async () => {
  const res = await fetch(toBackendUrl('/list_services?page=1&page_size=20'))
  return res.json() as Promise<{ services: Array<ServiceData> }>
}
