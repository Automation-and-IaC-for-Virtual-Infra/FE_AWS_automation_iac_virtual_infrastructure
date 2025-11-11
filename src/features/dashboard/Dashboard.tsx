'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { SERVICE_STATUS } from '@/constants/common'
import { ROUTES } from '@/constants/route'
import { calculateUptime } from '@/utils/string'
import { Activity, ArrowRight, Bell, CheckCircle, Server, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ServiceData } from '../aws/services/libs/types'
import { getSessionNewest } from '../infrastructure/setup/libs/fetchers'
import NotificationItem from '../notification/components/NotificationItem'
import { useNotifications } from '../notification/context/NotificationContext'
import { fetchEstCostMonthly } from './libs/fetchers'
import { EstCostData } from './libs/types'

export default function Dashboard({ services }: { services: ServiceData[] }) {
  const { unreadCount, loading: loadingNotification, notifications } = useNotifications()

  const [isLoading, setIsLoading] = useState(true)
  const [estCostData, setEstCostData] = useState<EstCostData | null>(null)

  const runningServices = useMemo(
    () => services.filter((s) => s.status === SERVICE_STATUS.RUNNING),
    [services]
  )

  const getEstCost = async () => {
    setIsLoading(true)
    const resNewestSession = await getSessionNewest()
    console.log('🚀 ~ HomePage ~ resNewestSession:', resNewestSession)
    if (resNewestSession?.session_id) {
      const resEstCost = await fetchEstCostMonthly(resNewestSession.session_id)
      console.log('🚀 ~ HomePage ~ resEstCost:', resEstCost)
      if (resEstCost.success) {
        setEstCostData(resEstCost.results)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getEstCost()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's your infrastructure overview</p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Activity className="w-4 h-4 text-green-600" />
            All Systems Operational
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Total Services */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{services?.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Server className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {runningServices?.length} Running
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  {services.filter((i) => i.status === SERVICE_STATUS.DELETED)?.length} Deleted
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Cost */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monthly Cost</p>
                  {isLoading ? (
                    <Spinner className="size-6 mx-3 my-2" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      ${estCostData ? estCostData?.total_in_month : '0.00'}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Estimated for current month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Running Services */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                Running Services
              </CardTitle>
              <Link href={ROUTES.SERVICES}>
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="size-full">
              <div className="space-y-3 size-full">
                {runningServices?.length > 0 ? (
                  runningServices.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Server className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.service_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Uptime</p>
                          <p className="text-sm font-medium text-gray-900">
                            {calculateUptime(service.created_at)}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Running
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 size-full flex justify-center items-center">
                    No running services available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Unread Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white hover:bg-red-600">{unreadCount}</Badge>
                )}
              </CardTitle>
              <Link href={ROUTES.NOTIFICATIONS}>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loadingNotification ? (
                  <>
                    <Skeleton className="w-full h-30" />
                    <Skeleton className="w-full h-30" />
                    <Skeleton className="w-full h-30" />
                  </>
                ) : (
                  notifications
                    .slice(0, 3)
                    .map((notification) => (
                      <NotificationItem key={notification.id} item={notification} isPreview />
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
