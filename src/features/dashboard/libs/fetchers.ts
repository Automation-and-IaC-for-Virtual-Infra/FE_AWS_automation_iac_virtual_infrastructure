'use server'

import { COMMON_API } from '@/constants/api'
import { apiBERequest } from '@/utils/api'

export const fetchEstCostMonthly = async (session_id: string) => {
  const res = await apiBERequest({
    path: COMMON_API.EST_COST,
    options: {
      method: 'POST',
      body: JSON.stringify({ session_id }),
    },
  })

  return res
}
