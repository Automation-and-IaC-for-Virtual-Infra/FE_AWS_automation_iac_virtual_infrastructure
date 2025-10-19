import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cx } from 'class-variance-authority'
import { ExternalLink } from 'lucide-react'
import { NotificationData } from '../libs/types'

export default function NotificationItem({ item }: { item: NotificationData }) {
  return (
    <Card
      key={item.id}
      className="border border-blue-100 bg-gradient-to-br from-white to-blue-50 hover:shadow-md transition gap-2"
    >
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="space-y-1">
          <div className="text-xs text-gray-500 flex gap-2 items-center">
            [{item.datetime}]
            <Badge
              variant="outline"
              className={cx(
                item.type.includes('ERROR') && 'bg-red-500 border-red-500 text-white',
                item.type.includes('SUCCESS') && 'bg-green-500 border-green-500 text-white',
                !item.type.includes('ERROR') &&
                  !item.type.includes('SUCCESS') &&
                  'bg-yellow-500 border-yellow-500 text-white'
              )}
            >
              {item.type}
            </Badge>
          </div>
          <CardTitle className="text-base font-medium">{item.title}</CardTitle>
        </div>

        {item.link && (
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="flex items-center gap-1 text-blue-700 hover:text-blue-900"
          >
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              View Details
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 leading-relaxed">{item.content}</p>
      </CardContent>
    </Card>
  )
}
