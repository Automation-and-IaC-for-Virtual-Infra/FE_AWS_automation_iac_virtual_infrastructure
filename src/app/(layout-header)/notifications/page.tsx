import { createPageTitle, PAGE_TITLES } from '@/constants/route'
import { fetchNotifications } from '@/features/notification/libs/fetchers'
import { NotificationSearchParams } from '@/features/notification/libs/types'
import Notifications from '@/features/notification/Notification'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: createPageTitle(PAGE_TITLES.NOTIFICATIONS),
}

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
