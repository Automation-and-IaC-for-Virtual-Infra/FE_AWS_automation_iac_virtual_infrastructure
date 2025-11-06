import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { DATE_FORMAT, NOTIFICATION_LABELS, NOTIFICATION_TYPES_ENUM } from '@/constants/common'
import { cx } from 'class-variance-authority'
import { format } from 'date-fns'
import { CheckCircle2, Clock, ExternalLink, XCircle } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { handleMarkAsRead } from '../libs/actions'
import { NotificationData } from '../libs/types'

const statusConfig = {
  [NOTIFICATION_TYPES_ENUM.BUILD_SUCCESS]: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    border: 'border-l-emerald-500',
  },
  [NOTIFICATION_TYPES_ENUM.BUILD_ERROR]: {
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: XCircle,
    iconColor: 'text-rose-600',
    border: 'border-l-rose-500',
  },
  [NOTIFICATION_TYPES_ENUM.APPLY_SUCCESS]: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle2,
    iconColor: 'text-blue-600',
    border: 'border-l-blue-500',
  },
  [NOTIFICATION_TYPES_ENUM.APPLY_ERROR]: {
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: XCircle,
    iconColor: 'text-orange-600',
    border: 'border-l-orange-500',
  },
  [NOTIFICATION_TYPES_ENUM.NEED_APPROVAL]: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
    iconColor: 'text-amber-600',
    border: 'border-l-amber-500',
  },
}

export default function NotificationItem({ item }: { item: NotificationData }) {
  const [isRead, setIsRead] = useState(item.is_read)

  const config = statusConfig[item.type as NOTIFICATION_TYPES_ENUM] || {
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: CheckCircle2,
    iconColor: 'text-gray-600',
    border: 'border-l-gray-500',
  }

  const Icon = config.icon

  const onMarkAsRead = useCallback(async () => {
    if (isRead) return

    const res = await handleMarkAsRead(item.id)
    if (res.success) {
      setIsRead(1)
    }
  }, [isRead, item.id])

  const content = useMemo(() => {
    const splitContent = item.content.split('\n')
    if (item.type === NOTIFICATION_TYPES_ENUM.NEED_APPROVAL) {
      return splitContent.map((line, index) => {
        if (index === 3) return null // Skip token line
        if (index === 4) {
          const link = line.replace('Approval Link:', '').trim()
          return (
            <div key={index} className="flex items-center gap-2 mt-1">
              <span>Approval Link: </span>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline flex gap-1 items-center"
                onClick={onMarkAsRead}
              >
                <ExternalLink className="w-3 h-3" />
                Link
              </a>
            </div>
          )
        }

        return (
          <p key={index} className={index > 0 ? 'mt-1' : ''}>
            {line}
          </p>
        )
      })
    }

    return splitContent.map((line, index) => (
      <p key={index} className={index > 0 ? 'mt-1' : ''}>
        {line}
      </p>
    ))
  }, [item.content, item.type, onMarkAsRead])

  return (
    <Card
      className={cx(
        'border-l-4 hover:shadow-lg transition-all duration-200 p-0 pt-4 relative cursor-pointer',
        isRead ? 'bg-white' : 'bg-blue-50',
        config.border
      )}
    >
      {!isRead && (
        <div className="absolute -top-1 right-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <div className={cx('mt-0.5', config.iconColor)}>
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-2">
              {/* Status Badge & Source */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cx('px-2.5 py-0.5 font-medium', config.badge)}>
                  {NOTIFICATION_LABELS[item.type]}
                </Badge>
                <Badge variant="outline" className="px-2.5 py-0.5 font-normal text-gray-600">
                  {item.title}
                </Badge>
              </div>

              {/* Content */}
              <div className="text-sm text-gray-700 leading-relaxed">{content}</div>

              {/* Timestamp */}
              <p className="text-xs text-gray-500">
                {format(new Date(item.updated_at || item.created_at), DATE_FORMAT.FULL)}
              </p>
            </div>
          </div>

          {/* View Details Button */}
          {item?.detail_link && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cx(
                'shrink-0 text-blue-600 hover:text-blue-700',
                isRead ? 'hover:bg-blue-50 dark:hover:bg-blue-100' : 'hover:bg-blue-200'
              )}
              onClick={onMarkAsRead}
            >
              <a href={item.detail_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                View log
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
