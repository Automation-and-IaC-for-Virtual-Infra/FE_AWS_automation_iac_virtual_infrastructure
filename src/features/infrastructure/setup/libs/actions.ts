'use server'

import { COMMON_API } from '@/constants/api'
import { ENV } from '@/constants/env'
import { toBackendUrl } from '@/utils/url'
import { InfraData } from './types'

export const handleApplySpec = async (session_id: string, spec: InfraData) => {
  const res = await fetch(toBackendUrl(COMMON_API.APPLY_SPEC), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ENV.BACKEND_API_KEY || '',
    },
    body: JSON.stringify({
      session_id,
      spec,
    }),
  })

  return await res.json()
}

export const handleGenTerraform = async (session_id: string) => {
  const res = await fetch(toBackendUrl(COMMON_API.GEN_TF), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ENV.BACKEND_API_KEY || '',
    },
    body: JSON.stringify({
      session_id,
    }),
  })

  return await res.json()
}

export const handlePushToRepository = async (session_id: string) => {
  const res = await fetch(toBackendUrl(COMMON_API.GIT_PUSH), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ENV.BACKEND_API_KEY || '',
    },
    body: JSON.stringify({
      session_id,
      github_pat: ENV.GITHUB_PAT,
    }),
  })

  return await res.json()
}
