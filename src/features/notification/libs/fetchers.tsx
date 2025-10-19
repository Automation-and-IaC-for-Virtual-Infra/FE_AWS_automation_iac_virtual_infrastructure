import { MOCK_API } from '@/constants/api'
import { apiRequest } from '@/utils/api'
import { NotificationSearchParams } from './types'

export const fetchNotifications = async (searchParams: NotificationSearchParams) => {
  const res = await apiRequest({
    path: MOCK_API.NOTIFICATIONS,
    searchParams,
  })

  return res
}
