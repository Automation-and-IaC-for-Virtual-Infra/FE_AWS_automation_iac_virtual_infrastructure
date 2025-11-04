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

  const period = 86400 / 24 // 1 hour

  const MetricDataQueries = instanceIds.flatMap((id, idx) => [
    {
      Id: `cpu_${idx}`,
      MetricStat: {
        Metric: {
          Namespace: 'AWS/EC2',
          MetricName: 'CPUUtilization',
          Dimensions: [{ Name: 'InstanceId', Value: id }],
        },
        Period: period,
        Stat: 'Average',
      },
      Label: `${id}-CPUUtilization`,
      ReturnData: true,
    },
    {
      Id: `network_in_${idx}`,
      MetricStat: {
        Metric: {
          Namespace: 'AWS/EC2',
          MetricName: 'NetworkIn',
          Dimensions: [{ Name: 'InstanceId', Value: id }],
        },
        Period: period,
        Stat: 'Sum',
      },
      Label: `${id}-NetworkIn`,
      ReturnData: true,
    },
    {
      Id: `network_out_${idx}`,
      MetricStat: {
        Metric: {
          Namespace: 'AWS/EC2',
          MetricName: 'NetworkOut',
          Dimensions: [{ Name: 'InstanceId', Value: id }],
        },
        Period: period,
        Stat: 'Sum',
      },
      Label: `${id}-NetworkOut`,
      ReturnData: true,
    },
    {
      Id: `disk_read_${idx}`,
      MetricStat: {
        Metric: {
          Namespace: 'AWS/EC2',
          MetricName: 'DiskReadBytes',
          Dimensions: [{ Name: 'InstanceId', Value: id }],
        },
        Period: period,
        Stat: 'Sum',
      },
      Label: `${id}-DiskReadBytes`,
      ReturnData: true,
    },
    {
      Id: `disk_write_${idx}`,
      MetricStat: {
        Metric: {
          Namespace: 'AWS/EC2',
          MetricName: 'DiskWriteBytes',
          Dimensions: [{ Name: 'InstanceId', Value: id }],
        },
        Period: period,
        Stat: 'Sum',
      },
      Label: `${id}-DiskWriteBytes`,
      ReturnData: true,
    },
    {
      Id: `status_${idx}`,
      MetricStat: {
        Metric: {
          Namespace: 'AWS/EC2',
          MetricName: 'StatusCheckFailed',
          Dimensions: [{ Name: 'InstanceId', Value: id }],
        },
        Period: period,
        Stat: 'Maximum',
      },
      Label: `${id}-Status`,
      ReturnData: true,
    },
  ])

  const command = new GetMetricDataCommand({
    MetricDataQueries,
    StartTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    EndTime: new Date(),
  })

  try {
    const response = await client.send(command)
    return Response.json({ success: true, data: response })
  } catch (error) {
    console.error('❌ Error fetching metrics:', error)
    return Response.json(
      { success: false, message: 'Error fetching CloudWatch metrics', error },
      { status: 500 }
    )
  }
}
