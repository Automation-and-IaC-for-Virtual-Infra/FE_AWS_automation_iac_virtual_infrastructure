'use server'

import { AWS_API } from '@/constants/api'
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
