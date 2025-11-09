import { ENV } from '@/constants/env'
import crypto from 'crypto'
import { formatDistance } from 'date-fns'

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

export const formatCamelCase = (str: string) => {
  return str.replace(/([A-Z])/g, ' $1').trim()
}

export function calculateUptime(createdAt: string): string {
  const distance = formatDistance(new Date(createdAt), new Date(), {
    includeSeconds: false,
  })

  // Convert "2 days" -> "2d", "14 hours" -> "14h"
  return distance
    .replace(/about /g, '')
    .replace(/ days?/g, 'd')
    .replace(/ hours?/g, 'h')
    .replace(/ minutes?/g, 'm')
    .replace(/ seconds?/g, 's')
    .split(' ')
    .slice(0, 2) // Only take first 2 parts (e.g., "2d 14h")
    .join(' ')
}
