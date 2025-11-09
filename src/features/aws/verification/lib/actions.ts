'use server'

import { AWS_API, COMMON_API_2 } from '@/constants/api'
import { LIST_AWS_CONNECTION_KEYS } from '@/constants/common'
import { apiBE2Request } from '@/utils/api'
import { toFrontendUrl } from '@/utils/url'

export async function verifyAwsCredentials(credentials: {
  accessKeyId: string
  secretAccessKey: string
  region: string
}) {
  const response = await fetch(toFrontendUrl(AWS_API.GET_AWS_VERIFICATION), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  return response.json()
}

export async function checkAlreadyVerified() {
  const res = await Promise.all(
    LIST_AWS_CONNECTION_KEYS.map(async (key) => {
      const res = await apiBE2Request({
        path: `${COMMON_API_2.AWS_CONNECTION}?parameterName=${key}`,
      })
      return res
    })
  )
  if (res.every((item) => item?.parameter?.value)) return true // all keys exist
  return false
}

export async function updateAwsConnection(listConnections: Array<{ name: string; value: string }>) {
  const res = await Promise.all(
    listConnections.map(async (connection) => {
      const response = await apiBE2Request({
        path: COMMON_API_2.AWS_CONNECTION,
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parameter_name: connection.name,
            parameter_value: connection.value,
            overwrite: true,
            parameter_type: 'String',
          }),
        },
      })
      return response
    })
  )
  if (res.every((item) => item.statusCode === 200)) {
    return { success: true, message: 'AWS connection stored successfully' }
  }

  return { success: false, message: 'Failed to store AWS connection' }
}
