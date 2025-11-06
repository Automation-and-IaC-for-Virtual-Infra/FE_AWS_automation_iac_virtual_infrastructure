import { fetchNotifications } from '@/features/notification/libs/fetchers'
import { NotificationSearchParams } from '@/features/notification/libs/types'
import Notifications from '@/features/notification/Notification'

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<NotificationSearchParams>
}) {
  const params = await searchParams

  const res = await fetchNotifications(params)
  if (!res) {
    throw new Error('Failed to fetch notifications')
  }

  return <Notifications result={res} params={params} />
}
