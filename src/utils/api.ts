'use server'

import { ALL_VALUE } from '@/constants/common'
import { ENV } from '@/constants/env'
import { getCookie } from './cookie'
import { toBackend2Url, toBackendUrl, toFrontendUrl } from './url'

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
      'X-API-Key': ENV.BACKEND_API_KEY,
      ...options.headers,
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
  return await response.json()
}

export const apiBERequest = async ({
  path,
  options = {},
  searchParams,
}: {
  path: string
  options?: RequestInit
  searchParams?: Record<string, any>
}) => {
  let url = toBackendUrl(path)

  options.headers = {
    'x-api-key': ENV.BACKEND_API_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
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
  return await response.json()
}

export const apiBE2Request = async ({
  path,
  options = {},
  searchParams,
}: {
  path: string
  options?: RequestInit
  searchParams?: Record<string, any>
}) => {
  let url = toBackend2Url(path)
  const idToken = await getCookie('idToken')
  if (!idToken) {
    throw new Error('No idToken cookie found')
  }

  options.headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
    ...options.headers,
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
  // if (!response.ok) {
  //   throw new Error('Failed to fetch API')
  // }
  return await response.json()
}
