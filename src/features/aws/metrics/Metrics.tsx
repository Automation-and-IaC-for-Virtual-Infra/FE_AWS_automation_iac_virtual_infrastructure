'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCapacity } from '@/utils/string'
import { format } from 'date-fns'
import { Activity, Server } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ServiceData } from '../services/libs/types'

type MetricResult = {
  Label: string
  Timestamps: string[]
  Values: number[]
}

export default function Metrics({
  service,
  metrics,
}: {
  service: ServiceData
  metrics: MetricResult[]
}) {
  const colors = ['#2563eb', '#16a34a', '#f97316', '#a855f7', '#dc2626', '#0891b2', '#ca8a04']

  // Group metrics by metric name
  const groupedMetrics = metrics.reduce(
    (acc, metric) => {
      const metricName = metric.Label.split('-').pop() || 'Unknown'
      if (!acc[metricName]) {
        acc[metricName] = []
      }
      acc[metricName].push(metric)
      return acc
    },
    {} as Record<string, MetricResult[]>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Service Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{service.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Service ID</p>
              <p className="font-mono text-sm">{service.service_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Public IP</p>
              <p className="font-medium">{service.public_ip}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Private IP</p>
              <p className="font-medium">{service.private_ip}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                variant="default"
                className={service.status === 1 ? 'bg-green-500' : 'bg-red-500 dark:text-white'}
              >
                {service.status === 1 ? 'Running' : 'Deleted'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">
                {format(new Date(service.created_at), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(groupedMetrics).map(([metricName, metricsList]) => {
              const latestValue = metricsList[0]?.Values[metricsList[0].Values.length - 1] ?? 0
              return (
                <div
                  key={metricName}
                  className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-white"
                >
                  <p className="text-sm text-gray-600 mb-1">{metricName}</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCapacity(latestValue)}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Individual Metric Charts */}
      <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(groupedMetrics).map(([metricName, metricsList], index) => {
          // Transform data for chart
          const chartData =
            metricsList[0]?.Timestamps.map((timestamp, i) => ({
              time: format(new Date(timestamp), 'HH:mm'),
              value: metricsList[0]?.Values[i] ?? 0,
            })) ?? []

          return (
            <Card key={metricName}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    {metricName}
                  </span>
                  <Badge variant="outline">{chartData.length} data points</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="text-gray-500 flex justify-center items-center h-[300px]">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 'auto']} />
                      <Tooltip formatter={(value: number) => [formatCapacity(value), metricName]} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={metricName}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {Object.keys(groupedMetrics).length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Metrics Available</h3>
              <p className="text-gray-500">
                There are no metrics data available for this service yet.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
