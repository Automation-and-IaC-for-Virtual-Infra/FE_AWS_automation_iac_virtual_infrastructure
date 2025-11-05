'use server'

import { ALL_VALUE } from '@/constants/common'
import { ENV } from '@/constants/env'
import { toBackendUrl, toFrontendUrl } from './url'

export const apiRequest = async ({
  path,
  options = {},
  searchParams,
  isFrontend = false,
}: {
  path: string
  options?: RequestInit
  searchParams?: Record<string, any>
  isFrontend?: boolean
}) => {
  let url = isFrontend ? toFrontendUrl(path) : toBackendUrl(path)

  // if backend, add API key header
  if (!isFrontend) {
    options.headers = {
      ...options.headers,
      'X-API-Key': ENV.BACKEND_API_KEY,
    }
  }

  if (searchParams) {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== ALL_VALUE) {
        params.append(key, String(value))
      }
    })
    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error('Failed to fetch API')
  }
  return response.json()
}
