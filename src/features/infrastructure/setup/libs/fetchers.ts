'use server'

import { COMMON_API } from '@/constants/api'
import { apiBERequest } from '@/utils/api'

export const getSessionNewest = async () => {
  const res = await apiBERequest({
    path: COMMON_API.GET_SESSION_NEWEST,
  })
  return res
}

export const getSpecBySessionId = async (session_id: string) => {
  const res = await apiBERequest({
    path: COMMON_API.GET_SPEC,
    options: {
      method: 'POST',
      body: JSON.stringify({ session_id }),
    },
  })
  return res
}
