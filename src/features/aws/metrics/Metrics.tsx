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
  Label: string // ex: "i-0123456789abcdef-CPU" (instanceId có thể chứa '-')
  Timestamps: string[]
  Values: number[]
}

type GroupedInfo = {
  summary: Record<string, number | null>
  chart: any[] // mảng mỗi metric: [{ time: 'dd/mm', MetricName: value }, ...]
}

export default function MetricsPage({ data }: { data: MetricResult[] | undefined }) {
  const [groupedData, setGroupedData] = useState<Record<string, GroupedInfo>>({})

  useEffect(() => {
    if (!data || !data.length) {
      setGroupedData({})
      return
    }

    const grouped: Record<string, GroupedInfo> = {}

    data.forEach((metric) => {
      // tách instanceId và metricName bằng dấu '-' cuối cùng
      const lastDash = metric.Label.lastIndexOf('-')
      const instanceId = lastDash === -1 ? metric.Label : metric.Label.substring(0, lastDash)
      const metricName = lastDash === -1 ? 'unknown' : metric.Label.substring(lastDash + 1)

      const timestamps = Array.isArray(metric.Timestamps) ? metric.Timestamps : []
      const values = Array.isArray(metric.Values) ? metric.Values : []

      // latest value: lấy phần tử cuối cùng nếu có
      const latestValue = values.length ? values[values.length - 1] : null

      // chuẩn hoá chart data: đảm bảo cùng độ dài, dùng index từ 0..n-1
      const formatted = timestamps.map((t, idx) => ({
        time: formatDate(t),
        [metricName]: typeof values[idx] === 'number' ? values[idx] : null,
      }))

      if (!grouped[instanceId]) grouped[instanceId] = { summary: {}, chart: [] }

      grouped[instanceId].summary[metricName] = latestValue ?? null
      grouped[instanceId].chart.push(formatted)
    })

    setGroupedData(grouped)
  }, [data])

  const colors = ['#2563eb', '#16a34a', '#f97316', '#a855f7', '#dc2626']

  return (
    <div className="p-6 space-y-6">
      {Object.entries(groupedData).length === 0 && (
        <div className="text-center text-sm text-gray-500">Không có metric để hiển thị</div>
      )}

      {Object.entries(groupedData).map(([instanceId, info]) => {
        // merge chart arrays (mỗi metric là 1 mảng) thành 1 mảng theo index
        const merged = mergeData(info.chart)

        return (
          <Card key={instanceId} className="w-full max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle>Service: {instanceId}</CardTitle>
            </CardHeader>

            {/* SUMMARY (safe: info.summary có thể rỗng) */}
            <CardContent className="pb-0">
              <div className="grid grid-cols-3 gap-4 text-sm">
                {Object.keys(info.summary ?? {}).length === 0 ? (
                  <div className="col-span-3 text-gray-500">Không có metric</div>
                ) : (
                  Object.entries(info.summary ?? {}).map(([metricName, value]) => (
                    <div
                      key={metricName}
                      className="p-3 rounded border bg-gray-50 flex items-center justify-between"
                    >
                      <span className="font-semibold">{metricName}</span>
                      <span className="ml-2">{formatValue(value)}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>

            {/* CHART */}
            <CardContent>
              {merged.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={merged}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 'auto']} />
                    <Tooltip />
                    <Legend />
                    {Object.keys(merged[0])
                      .filter((k) => k !== 'time')
                      .map((metricName, idx) => (
                        <Line
                          key={metricName}
                          type="monotone"
                          dataKey={metricName}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div>Không có metric cho service này</div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/** Merge many metric arrays into 1 array for Chart */
function mergeData(charts: any[]) {
  // charts = [ metricAFormattedArray, metricBFormattedArray, ... ]
  // return array where each index chứa merged object của mọi metric
  const maxLen = charts.reduce((m, arr) => Math.max(m, Array.isArray(arr) ? arr.length : 0), 0)
  const result: any[] = Array.from({ length: maxLen }, (_, i) => ({}))

  charts.forEach((data) => {
    if (!Array.isArray(data)) return
    data.forEach((entry: any, idx: number) => {
      result[idx] = { ...result[idx], ...entry }
    })
  })

  // filter out empty objects (safety)
  return result.filter((r) => Object.keys(r).length > 0)
}

/** safe format value */
function formatValue(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  // nếu là một số lớn (bytes) hiển thị human readable, nếu là percent giữ 2 chữ số
  // heuristic: nếu > 1000 coi là bytes-like
  if (Math.abs(value) > 1024) {
    if (Math.abs(value) > 1024 * 1024 * 1024) return (value / 1024 / 1024 / 1024).toFixed(2) + ' GB'
    if (Math.abs(value) > 1024 * 1024) return (value / 1024 / 1024).toFixed(2) + ' MB'
    return (value / 1024).toFixed(2) + ' KB'
  }
  return Number(value).toFixed(2)
}

function formatDate(t: string) {
  try {
    return new Date(t).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    })
  } catch {
    return String(t)
  }
}
