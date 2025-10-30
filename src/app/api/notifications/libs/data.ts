import { AwsNotification2, NOTIFICATION_TYPES } from '@/features/notification/libs/types'

export const mockNotifications = Array.from({ length: 36 }).map((_, i) => ({
  id: i + 1,
  datetime: `2025-10-18 20:${(i % 60).toString().padStart(2, '0')}:00`,
  type: NOTIFICATION_TYPES[(i % (NOTIFICATION_TYPES.length - 1)) + 1],
  title: `Notification #${i + 1}`,
  content: 'Sample notification content about build or apply process.',
  link: 'https://console.aws.amazon.com/',
}))

export const mockNotifications2: AwsNotification2[] = [
  // --- 50 CodeBuild notifications ---
  ...Array.from({ length: 50 }, (_, i) => {
    const statuses = ['SUCCEEDED', 'FAILED', 'IN_PROGRESS', 'STOPPED'] as const
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    return {
      id: `evt-cb-${i + 1}`,
      detailType: 'CodeBuild Build State Change',
      source: 'aws.codebuild' as const,
      accountId: '724772078120',
      region: 'ap-southeast-1',
      time: new Date(Date.now() - i * 3600 * 1000).toISOString(),
      status,
      projectName: `project-${i + 1}`,
      buildId: `arn:aws:codebuild:ap-southeast-1:724772078120:build/project-${i + 1}:${i + 10}`,
      buildNumber: i + 10,
      logsLink: `https://console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#logEventViewer:group=/aws/codebuild/project-${i + 1}`,
      artifactLocation: `s3://build-artifacts/project-${i + 1}/output.zip`,
      initiator: `user-${(i % 5) + 1}`,
      errorMessage: status === 'FAILED' ? 'Build failed due to test errors.' : undefined,
      errorCode: status === 'FAILED' ? 'BUILD_FAILED' : undefined,
    }
  }),

  // --- 50 CodePipeline notifications ---
  ...Array.from({ length: 50 }, (_, i) => {
    const statuses = ['SUCCEEDED', 'FAILED', 'IN_PROGRESS', 'STOPPED', 'CANCELED'] as const
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    return {
      id: `evt-cp-${i + 1}`,
      detailType: 'CodePipeline Pipeline Execution State Change',
      source: 'aws.codepipeline' as const,
      accountId: '724772078120',
      region: 'ap-southeast-1',
      time: new Date(Date.now() - (i + 50) * 3600 * 1000).toISOString(),
      status,
      pipelineName: `pipeline-${i + 1}`,
      executionId: `exec-${Math.random().toString(36).substring(2, 10)}`,
      logsLink: `https://console.aws.amazon.com/codesuite/codepipeline/pipelines/pipeline-${i + 1}/view`,
      initiator: `pipeline-user-${(i % 5) + 1}`,
      errorMessage: status === 'FAILED' ? 'Pipeline failed during Deploy stage.' : undefined,
      errorCode: status === 'FAILED' ? 'PIPELINE_FAILED' : undefined,
    }
  }),
]
