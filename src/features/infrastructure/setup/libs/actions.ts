'use server'

import { COMMON_API } from '@/constants/api'
import { apiBERequest } from '@/utils/api'
import { InfraData } from './types'

export const handleSuggestConfig = async (prompt: string, resource_type: string) => {
  const res = await apiBERequest({
    path: COMMON_API.SUGGEST_CONFIG,
    options: {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        resource_type,
      }),
    },
  })
  return res
}

export const handleApplySpec = async (session_id: string, spec: InfraData) => {
  const res = await apiBERequest({
    path: COMMON_API.APPLY_SPEC,
    options: {
      method: 'POST',
      body: JSON.stringify({
        session_id,
        spec,
      }),
    },
  })
  return res
}

export const handleGenTerraform = async (session_id: string) => {
  const res = await apiBERequest({
    path: COMMON_API.GEN_TF,
    options: {
      method: 'POST',
      body: JSON.stringify({
        session_id,
      }),
    },
  })
  return res
}

export const handlePushToRepository = async (session_id: string) => {
  const res = await apiBERequest({
    path: `${COMMON_API.PUSH_TERRA}?session_id=${session_id}`,
    options: {
      method: 'POST',
    },
  })
  return res
}
