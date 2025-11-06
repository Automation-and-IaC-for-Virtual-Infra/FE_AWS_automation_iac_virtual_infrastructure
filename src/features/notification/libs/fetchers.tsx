'use server'

import { COMMON_API, MOCK_API } from '@/constants/api'
import { PaginatedResponse } from '@/types/api'
import { apiBERequest, apiRequest } from '@/utils/api'
import { NotificationData, NotificationSearchParams } from './types'

export const fetchNotifications = async (searchParams: NotificationSearchParams) => {
  const res = await apiBERequest({
    path: COMMON_API.NOTIFICATIONS,
    searchParams,
  })

  return res as PaginatedResponse<NotificationData>
}

export const fetchAwsNotifications = async (searchParams: NotificationSearchParams) => {
  const res = await apiRequest({
    path: MOCK_API.AWS_NOTIFICATIONS,
    searchParams,
    isFrontend: true,
  })

  return res
}
