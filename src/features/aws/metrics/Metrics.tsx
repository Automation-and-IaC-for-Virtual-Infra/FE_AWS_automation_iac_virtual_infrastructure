'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type MetricResult = {
  Id: string
  Label: string
  Timestamps: string[]
  Values: number[]
}

export default function MetricsPage({ data }: { data: any }) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const metrics: MetricResult[] = data || []
    if (!metrics.length) return

    const timestamps = metrics[0].Timestamps.map((t) =>
      new Date(t).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      })
    ).reverse()

    const formatted = timestamps.map((time, idx) => {
      const entry: Record<string, any> = { time }
      metrics.forEach((m) => {
        const values = [...m.Values].reverse()
        entry[m.Label] = values[idx] ?? null
      })
      return entry
    })

    setChartData(formatted)
  }, [data])

  const colors = [
    '#2563eb', // blue
    '#16a34a', // green
    '#f97316', // orange
    '#a855f7', // purple
    '#dc2626', // red
  ]

  return (
    <div className="p-6">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>EC2 CPU Utilization (30 ngày qua)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 'auto']} unit="%" />
              <Tooltip formatter={(val: any) => `${val?.toFixed(2)}%`} />
              <Legend />

              {chartData.length > 0 &&
                Object.keys(chartData[0])
                  .filter((key) => key !== 'time')
                  .map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
