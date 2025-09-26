export interface AwsService {
  id: string
  resourceType: string
  displayName: string
  config: Record<string, any>
  connections: string[]
  properties?: Record<string, any>
}

export interface ListAwsServicesResponse {
  count: number
  services: AwsService[]
}
