'use server'

import { COMMON_API } from '@/constants/api'
import { apiBERequest } from '@/utils/api'

export const handleMarkAsRead = async (id: number) => {
  const res = await apiBERequest({
    path: `${COMMON_API.READ_NOTI}/${id}`,
    options: {
      method: 'PUT',
    },
  })
  return res
}
