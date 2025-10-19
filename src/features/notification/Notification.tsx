'use client'

import { NOTIFICATION_TYPES, NotificationData, NotificationSearchParams } from './libs/types'

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
  result: PaginatedResponse<NotificationData[]>
  params: NotificationSearchParams
}) {
  const router = useRouter()

  const { type } = params
  const { data = [], pagination } = result
  const { page = 1, total = 0, limit = 20 } = pagination || {}

  const [loading, setLoading] = useState(false)

  const handleSelectChange = (value: string) => {
    setLoading(true)
    router.push(`${ROUTES.NOTIFICATIONS}/?type=${value}`)
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

          <CommonPagination total={total} page={page} limit={limit} />

          <Select onValueChange={handleSelectChange} value={type || ALL_VALUE}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notification List */}
        <div className="grid gap-4">
          {data.length === 0 ? (
            <p className="text-center text-gray-500 italic py-10">No notifications found.</p>
          ) : (
            data.map((item) => <NotificationItem key={item.id} item={item} />)
          )}
        </div>

        <CommonPagination total={total} page={page} limit={limit} />
      </div>
    </LoadingContent>
  )
}
