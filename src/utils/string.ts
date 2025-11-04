import { ENV } from '@/constants/env'
import crypto from 'crypto'

export const getSecretHash = (username: string) => {
  return crypto
    .createHmac('SHA256', ENV.COGNITO_CLIENT_SECRET)
    .update(username + ENV.COGNITO_CLIENT_ID)
    .digest('base64')
}

export function formatCapacity(value: number | null | undefined) {
  if (!value || Number.isNaN(value)) return 'N/A'

  if (Math.abs(value) > 1024) {
    if (Math.abs(value) > 1024 * 1024 * 1024) return (value / 1024 / 1024 / 1024).toFixed(2) + ' GB'
    if (Math.abs(value) > 1024 * 1024) return (value / 1024 / 1024).toFixed(2) + ' MB'
    return (value / 1024).toFixed(2) + ' KB'
  }

  return Number(value).toFixed(2)
}
