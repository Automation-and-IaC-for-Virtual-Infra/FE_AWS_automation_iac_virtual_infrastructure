'use server'

import { AWS_API, COMMON_API } from '@/constants/api'
import { ApiResponse, createErrorResponse } from '@/types/api'
import { toBackendUrl, toFrontendUrl } from '@/utils/url'
import { ListAwsServicesData, ServiceData } from './types'

export const getAwsServices = async () => {
  try {
    const url = toFrontendUrl(AWS_API.GET_AWS_SERVICES)
    const res = await fetch(url)

    return (await res.json()) as Promise<ApiResponse<ListAwsServicesData>>
  } catch (error) {
    return createErrorResponse('Failed to fetch AWS services', 'FETCH_ERROR', { error })
  }
}

export const fetchServices = async () => {
  const res = await fetch(toBackendUrl(`${COMMON_API.LIST_SERVICES}?page=1&page_size=100`))
  return res.json() as Promise<{ items: Array<ServiceData> }>
}
