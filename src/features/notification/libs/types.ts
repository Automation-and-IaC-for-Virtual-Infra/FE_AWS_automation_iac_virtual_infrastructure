import { ALL_VALUE } from '@/constants/common'

export const NOTIFICATION_TYPES = [
  ALL_VALUE,
  'BUILD SUCCESS',
  'APPLY SUCCESS',
  'BUILD ERROR',
  'APPLY ERROR',
  'NEED APPROVAL',
] as const

export const AWS_SERVICE_NAMES = ['CodeBuild', 'CodePipeline'] as const

export const AWS_NOTIFICATION_STATUSES = [
  'SUCCEEDED',
  'FAILED',
  'RUNNING',
  'STOPPED',
  'ERROR',
] as const

export interface AwsNotification {
  id: string
  service: (typeof AWS_SERVICE_NAMES)[number]
  type: string
  status: (typeof AWS_NOTIFICATION_STATUSES)[number]
  resourceName: string
  region: string
  time: string
  detailLink?: string
  extra?: Record<string, any>
}

export interface NotificationData {
  id: number
  datetime: string
  type: (typeof NOTIFICATION_TYPES)[number]
  title: string
  content: string
  link: string
}

export interface NotificationSearchParams {
  status: (typeof AWS_NOTIFICATION_STATUSES)[number]
  service: (typeof AWS_SERVICE_NAMES)[number]
  page: number
  per_page: number
}

export type AwsEventSource = 'aws.codebuild' | 'aws.codepipeline'

export type BuildStatus =
  | 'SUCCEEDED'
  | 'FAILED'
  | 'IN_PROGRESS'
  | 'STOPPED'
  | 'CANCELED'
  | 'TIMED_OUT'
  | string

export interface AwsNotification2 {
  id: string
  source: 'aws.codebuild' | 'aws.codepipeline'
  detailType: string
  status: 'SUCCEEDED' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED' | 'CANCELED'
  region: string
  time: string // ISO string
  projectName?: string
  pipelineName?: string
  buildNumber?: number
  buildId?: string
  executionId?: string
  initiator?: string
  logsLink?: string
  artifactLocation?: string
  errorMessage?: string
  errorCode?: string
}
