import { ENV } from '@/constants/env'

export const toBackendUrl = (path: string) => {
  const backendUrl = ENV.FRONTEND_SERVER_URL || 'http://localhost:3000'
  return `${backendUrl}${path}`
}
