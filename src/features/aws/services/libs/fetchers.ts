'use server'

import { AWS_API } from '@/constants/api'
import { toBackendUrl } from '@/utils/api'
import { ListAwsServicesResponse } from './types'

export const getAwsServices = async () => {
  const url = toBackendUrl(AWS_API.GET_AWS_SERVICES)
  const res = await fetch(url)

  return res.json() as Promise<ListAwsServicesResponse>
}
