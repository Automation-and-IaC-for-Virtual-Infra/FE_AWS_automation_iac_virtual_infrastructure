import { NOTIFICATION_OPTIONS } from './../../../constants/common'
export interface NotificationData {
  id: number
  title: string
  content: string
  interpretation: string | null
  type: number
  detail_link: string
  is_read: number
  created_at: string
  updated_at: string
}

export interface NotificationSearchParams {
  type?: (typeof NOTIFICATION_OPTIONS)[number]['value'] | string
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
