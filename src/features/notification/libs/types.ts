import { ALL_VALUE } from '@/constants/common'

export const NOTIFICATION_TYPES = [
  ALL_VALUE,
  'BUILD SUCCESS',
  'APPLY SUCCESS',
  'BUILD ERROR',
  'APPLY ERROR',
  'NEED APPROVAL',
] as const

export interface NotificationData {
  id: number
  datetime: string
  type: (typeof NOTIFICATION_TYPES)[number]
  title: string
  content: string
  link: string
}

export interface NotificationSearchParams {
  type: (typeof NOTIFICATION_TYPES)[number]
  page: number
  per_page: number
}
