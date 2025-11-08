'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/route'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  Server,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

// Mock data - Replace with real data
const mockServices = [
  {
    id: '1',
    name: 'WebServerVPC',
    type: 'AWS::EC2::VPC',
    status: 'running',
    uptime: '2d 14h',
    region: 'ap-southeast-1',
  },
  {
    id: '2',
    name: 'PublicSubnet',
    type: 'AWS::EC2::Subnet',
    status: 'running',
    uptime: '2d 14h',
    region: 'ap-southeast-1',
  },
  {
    id: '3',
    name: 'WebServerInstance',
    type: 'AWS::EC2::Instance',
    status: 'running',
    uptime: '1d 8h',
    region: 'ap-southeast-1',
  },
]

const mockNotifications = [
  {
    id: '1',
    title: 'Deployment Successful',
    message: 'Infrastructure deployed successfully',
    time: '5m ago',
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Manual Approval Required',
    message: 'Pipeline khuong-pipeline-hackathon-01 needs approval',
    time: '1h ago',
    read: false,
    type: 'warning',
  },
  {
    id: '3',
    title: 'Resource Created',
    message: 'New EC2 instance created in ap-southeast-1',
    time: '3h ago',
    read: false,
    type: 'info',
  },
]

const mockMetrics = {
  totalServices: 12,
  runningServices: 10,
  stoppedServices: 2,
  totalCost: 45.67,
  cpuUsage: 45,
  memoryUsage: 62,
  networkIn: 125.4,
  networkOut: 89.2,
}

export default function Dashboard() {
  const unreadNotifications = useMemo(() => mockNotifications.filter((n) => !n.read), [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's your infrastructure overview</p>
            {/* ✅ Mock Data Notice */}
            <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5 w-fit">
              <AlertCircle className="w-4 h-4" />
              <span>
                This is overview data. See detailed metrics in Services & Notifications pages.
              </span>
            </div>
          </div>
          <Badge variant="outline" className="gap-2">
            <Activity className="w-4 h-4 text-green-600" />
            All Systems Operational
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Services */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {mockMetrics.totalServices}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Server className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {mockMetrics.runningServices} Running
                </Badge>
                <Badge variant="outline" className="text-gray-600">
                  {mockMetrics.stoppedServices} Stopped
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* CPU Usage */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">CPU Usage</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{mockMetrics.cpuUsage}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${mockMetrics.cpuUsage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Memory Usage</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {mockMetrics.memoryUsage}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${mockMetrics.memoryUsage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Cost */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monthly Cost</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">${mockMetrics.totalCost}</p>
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
            <CardContent>
              <div className="space-y-3">
                {mockServices.map((service) => (
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
                        <p className="text-sm text-gray-500">{service.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Uptime</p>
                        <p className="text-sm font-medium text-gray-900">{service.uptime}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Running
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Unread Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Notifications
                {unreadNotifications.length > 0 && (
                  <Badge className="bg-red-500 text-white hover:bg-red-600">
                    {unreadNotifications.length}
                  </Badge>
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
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'success'
                            ? 'bg-green-100'
                            : notification.type === 'warning'
                              ? 'bg-yellow-100'
                              : 'bg-blue-100'
                        }`}
                      >
                        {notification.type === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : notification.type === 'warning' ? (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <Bell className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network Traffic */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Network Traffic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Inbound</span>
                  <span className="text-sm font-medium text-gray-900">
                    {mockMetrics.networkIn} MB/s
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Outbound</span>
                  <span className="text-sm font-medium text-gray-900">
                    {mockMetrics.networkOut} MB/s
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
