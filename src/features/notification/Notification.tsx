'use client'

import { NotificationData, NotificationSearchParams } from './libs/types'

import CommonPagination from '@/components/CommonPagination'
import LoadingContent from '@/components/LoadingContent'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ALL_VALUE, NOTIFICATION_OPTIONS } from '@/constants/common'
import { ROUTES } from '@/constants/route'
import { PaginatedResponse } from '@/types/api'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NotificationItem from './components/NotificationItem'

export default function Notifications({
  result,
  params,
}: {
  result: PaginatedResponse<NotificationData>
  params: NotificationSearchParams
}) {
  const router = useRouter()

  const { type = ALL_VALUE } = params
  const { items = [], page, page_size, total } = result

  const [loading, setLoading] = useState(false)

  const handleTypeChange = (value: string) => {
    setLoading(true)
    router.push(`${ROUTES.NOTIFICATIONS}/?type=${value}`)
  }

  useEffect(() => {
    setLoading(false)
  }, [items])

  return (
    <LoadingContent loading={loading}>
      <div className="p-6 space-y-6 bg-gray-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Notifications
          </h1>

          <div className="flex items-center gap-4">
            <Select onValueChange={handleTypeChange} value={type as string}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value as string}>
                    {t.label}
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
              <CommonPagination total={total} page={page} limit={page_size} />
            </div>
            <div className="grid gap-4 w-[800px]">
              {items.length === 0 ? (
                <p className="text-center text-gray-500 italic py-10">No notifications found.</p>
              ) : (
                items.map((item) => <NotificationItem key={item.id} item={item} />)
              )}
            </div>
            <div className="flex justify-center">
              <CommonPagination total={total} page={page} limit={page_size} />
            </div>
          </div>
        </div>
      </div>
    </LoadingContent>
  )
}
