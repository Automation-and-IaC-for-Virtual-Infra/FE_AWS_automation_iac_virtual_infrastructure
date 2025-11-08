import { ENV } from '@/constants/env'

export const toFrontendUrl = (path: string) => {
  const frontendUrl = ENV.FRONTEND_SERVER_URL || 'http://localhost:3000'
  return `${frontendUrl}${path}`
}

export const toBackendUrl = (path: string) => {
  const backendUrl = ENV.BACKEND_SERVER_URL || 'http://localhost:8001'
  return `${backendUrl}${path}`
}

export const toBackend2Url = (path: string) => {
  const backendUrl = ENV.BACKEND_SERVER_URL_2 || 'http://localhost:8001'
  return `${backendUrl}${path}`
}
