import { COMMON_API } from '@/constants/api'
import { toBackendUrl, toFrontendUrl } from '@/utils/url'
import { ServiceData } from '../../services/libs/types'

export const fetchMetrics = async (instanceIds: string) => {
  const res = await fetch(toFrontendUrl(`/api/aws/metric?instanceIds=${instanceIds}`))
  return res.json()
}

export const fetchServices = async () => {
  const res = await fetch(toBackendUrl(`${COMMON_API.LIST_SERVICES}?page=1&page_size=100`))
  return res.json() as Promise<{ items: Array<ServiceData> }>
}
