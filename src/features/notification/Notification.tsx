'use client'

import {
  AWS_NOTIFICATION_STATUSES,
  AWS_SERVICE_NAMES,
  AwsNotification2,
  NotificationSearchParams,
} from './libs/types'

import CommonPagination from '@/components/CommonPagination'
import LoadingContent from '@/components/LoadingContent'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ALL_VALUE } from '@/constants/common'
import { ROUTES } from '@/constants/route'
import { PaginatedResponse } from '@/types/api'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NotificationItem from './components/NotificationItem'

export default function Notifications({
  result,
  params,
}: {
  result: PaginatedResponse<AwsNotification2[]>
  params: NotificationSearchParams
}) {
  const router = useRouter()

  const { status = ALL_VALUE, service = ALL_VALUE } = params
  const { data = [], pagination } = result
  const { page = 1, total = 0, limit = 20 } = pagination || {}

  const [loading, setLoading] = useState(false)

  const handleStatusChange = (value: string) => {
    setLoading(true)
    router.push(`${ROUTES.NOTIFICATIONS}/?status=${value}&service=${service}`)
  }

  const handleServiceChange = (value: string) => {
    setLoading(true)
    router.push(`${ROUTES.NOTIFICATIONS}/?status=${status}&service=${value}`)
  }

  useEffect(() => {
    setLoading(false)
  }, [data])

  return (
    <LoadingContent loading={loading}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Notifications
          </h1>

          <div className="flex items-center gap-4">
            {/* Filter by Status */}
            <Select onValueChange={handleStatusChange} value={status}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Statuses</SelectItem>
                {AWS_NOTIFICATION_STATUSES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter by Service */}
            <Select onValueChange={handleServiceChange} value={service}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Services</SelectItem>
                {AWS_SERVICE_NAMES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex justify-center">
          <div className="w-[800px] flex flex-col gap-2">
            <div className="flex justify-center">
              <CommonPagination total={total} page={page} limit={limit} />
            </div>
            <div className="grid gap-4 w-[800px]">
              {data.length === 0 ? (
                <p className="text-center text-gray-500 italic py-10">No notifications found.</p>
              ) : (
                data.map((item) => <NotificationItem key={item.id} item={item} />)
              )}
            </div>
            <div className="flex justify-center">
              <CommonPagination total={total} page={page} limit={limit} />
            </div>
          </div>
        </div>
      </div>
    </LoadingContent>
  )
}
