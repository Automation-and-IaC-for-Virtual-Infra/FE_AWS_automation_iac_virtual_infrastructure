import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DATE_FORMAT } from '@/constants/common'
import { cx } from 'class-variance-authority'
import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { AwsNotification2 } from '../libs/types'

export default function NotificationItem({ item }: { item: AwsNotification2 }) {
  // --- Define dynamic colors based on status ---
  const statusColor =
    {
      SUCCEEDED: 'bg-green-500 border-green-500 text-white',
      FAILED: 'bg-red-500 border-red-500 text-white',
      IN_PROGRESS: 'bg-blue-500 border-blue-500 text-white',
      STOPPED: 'bg-gray-500 border-gray-500 text-white',
      CANCELED: 'bg-gray-400 border-gray-400 text-white',
    }[item.status] || 'bg-slate-400 text-white'

  const cardGradient =
    {
      SUCCEEDED: 'border-green-300 from-white to-green-50',
      FAILED: 'border-red-300 from-white to-red-50',
      IN_PROGRESS: 'border-blue-300 from-white to-blue-50',
      STOPPED: 'border-gray-300 from-white to-gray-50',
      CANCELED: 'border-gray-200 from-white to-gray-50',
    }[item.status] || 'border-slate-300 from-white to-slate-50'

  // --- Extra info to show in CardContent ---
  const extra: Record<string, string | number | undefined> = {
    ...(item.errorMessage && { ErrorMessage: item.errorMessage }),
  }

  return (
    <Card
      key={item.id}
      className={cx('border bg-gradient-to-br hover:shadow-md transition py-4 gap-4', cardGradient)}
    >
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="space-y-1">
          {/* --- Status & Source --- */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 items-center">
            <Badge className={cx('px-2', statusColor)}>{item.status}</Badge>

            <Badge variant="secondary" className="bg-slate-100 border-slate-200 text-slate-800">
              {item.detailType} {item?.buildNumber ? `#${item.buildNumber}` : ''}
            </Badge>

            <span className="text-gray-500">• {item.region}</span>
            <span className="text-gray-400">[{format(new Date(item.time), DATE_FORMAT.FULL)}]</span>
          </div>

          {/* --- Resource name --- */}
          <CardTitle className="text-base font-semibold text-gray-900">
            {item?.projectName || item?.pipelineName}
          </CardTitle>

          {/* --- Notification type --- */}
          {/* <p className="text-sm text-gray-700">{item.projectName}</p> */}
        </div>

        {/* --- View details link --- */}
        {item?.logsLink && (
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="flex items-center gap-1 text-blue-700 hover:text-blue-900"
          >
            <a href={item.logsLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              View Details
            </a>
          </Button>
        )}
      </CardHeader>

      {/* --- Extra metadata --- */}
      {Object.keys(extra).length > 0 && (
        <CardContent>
          <div className="text-sm text-gray-700 space-y-1">
            {Object.entries(extra).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-gray-100 pb-1">
                <span className="font-medium text-gray-500">{key}</span>
                <span className="text-gray-800 break-all">{String(value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
