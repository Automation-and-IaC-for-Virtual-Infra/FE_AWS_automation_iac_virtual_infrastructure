import { ALL_VALUE } from '@/constants/common'
import { ENV } from '@/constants/env'

export const toFrontendUrl = (path: string) => {
  const backendUrl = ENV.FRONTEND_SERVER_URL || 'http://localhost:3000'
  return `${backendUrl}${path}`
}

export const toBackendUrl = (path: string) => {
  const backendUrl = ENV.BACKEND_SERVER_URL || 'http://localhost:8001'
  return `${backendUrl}${path}`
}

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
