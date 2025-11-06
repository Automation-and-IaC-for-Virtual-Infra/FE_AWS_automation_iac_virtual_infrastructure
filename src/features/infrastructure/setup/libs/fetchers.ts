'use server'

import { COMMON_API } from '@/constants/api'
import { toBackendUrl } from '@/utils/url'

export const getTerraformBySessionId = async (session_id: string) => {
  const res = await fetch(toBackendUrl(COMMON_API.GET_TF), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.BACKEND_API_KEY || '',
    },
    body: JSON.stringify({ session_id }),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch Terraform files')
  }

  return await res.json()
}
