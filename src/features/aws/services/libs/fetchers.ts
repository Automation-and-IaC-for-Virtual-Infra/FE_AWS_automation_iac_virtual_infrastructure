'use server'

import { AWS_API } from '@/constants/api'
import { ApiResponse, createErrorResponse } from '@/types/api'
import { toFrontendUrl } from '@/utils/url'
import { ListAwsServicesData } from './types'

export const getAwsServices = async () => {
  try {
    const url = toFrontendUrl(AWS_API.GET_AWS_SERVICES)
    const res = await fetch(url)

    return res.json() as Promise<ApiResponse<ListAwsServicesData>>
  } catch (error) {
    return createErrorResponse('Failed to fetch AWS services', 'FETCH_ERROR', { error })
  }
}
