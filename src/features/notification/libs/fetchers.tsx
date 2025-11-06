'use server'

import { COMMON_API } from '@/constants/api'
import { PaginatedResponse } from '@/types/api'
import { apiBERequest } from '@/utils/api'
import { NotificationData, NotificationSearchParams } from './types'

export const fetchNotifications = async (searchParams: NotificationSearchParams) => {
  const res = await apiBERequest({
    path: COMMON_API.NOTIFICATIONS,
    searchParams,
  })

  return res as PaginatedResponse<NotificationData>
}
