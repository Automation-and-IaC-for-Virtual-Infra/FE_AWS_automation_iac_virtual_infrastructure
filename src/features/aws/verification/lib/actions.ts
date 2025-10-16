'use server'

import { AWS_API } from '@/constants/api'
import { toBackendUrl } from '@/utils/api'

export async function verifyAwsCredentials(credentials: {
  accessKeyId: string
  secretAccessKey: string
  region: string
}) {
  const response = await fetch(toBackendUrl(AWS_API.GET_AWS_VERIFICATION), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  return response.json()
}
