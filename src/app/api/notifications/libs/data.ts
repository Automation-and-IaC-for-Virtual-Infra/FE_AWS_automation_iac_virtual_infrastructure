import { NOTIFICATION_TYPES } from '@/features/notification/libs/types'

export const mockNotifications = Array.from({ length: 36 }).map((_, i) => ({
  id: i + 1,
  datetime: `2025-10-18 20:${(i % 60).toString().padStart(2, '0')}:00`,
  type: NOTIFICATION_TYPES[(i % (NOTIFICATION_TYPES.length - 1)) + 1],
  title: `Notification #${i + 1}`,
  content: 'Sample notification content about build or apply process.',
  link: 'https://console.aws.amazon.com/',
}))
