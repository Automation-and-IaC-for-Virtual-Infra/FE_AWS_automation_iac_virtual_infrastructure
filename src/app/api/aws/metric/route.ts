import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const instanceIdsParam = searchParams.get('instanceIds')
  if (!instanceIdsParam) {
    return Response.json({ success: false, message: 'Missing instanceIds' }, { status: 400 })
  }

  const instanceIds = instanceIdsParam.split(',').map((id) => id.trim())

  const client = new CloudWatchClient({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: process.env.METRIC_ACCESS_KEY!,
      secretAccessKey: process.env.METRIC_SECRET_KEY!,
    },
  })

  const MetricDataQueries = instanceIds.map((id, idx) => ({
    Id: `cpu_${idx}`,
    MetricStat: {
      Metric: {
        Namespace: 'AWS/EC2',
        MetricName: 'CPUUtilization',
        Dimensions: [{ Name: 'InstanceId', Value: id }],
      },
      // Period: 86400, // 1 day
      Period: 86400 / 24, // 1 hour
      Stat: 'Average',
    },
    Label: id,
    ReturnData: true,
  }))

  const command = new GetMetricDataCommand({
    MetricDataQueries,
    // StartTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    StartTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    EndTime: new Date(),
  })

  try {
    const response = await client.send(command)
    return Response.json({
      success: true,
      data: response.MetricDataResults,
    })
  } catch (error) {
    console.error('❌ Error fetching metrics:', error)
    return Response.json(
      { success: false, message: 'Error fetching CloudWatch metrics', error },
      { status: 500 }
    )
  }
}
