export interface AwsService {
  id: string
  resourceType: string
  displayName: string
  connections: string[]
  requiredProps: string[]
  requiredConnections: string[]
  recommendedConnections: string[]
  properties?: Record<string, any>
}

export interface ListAwsServicesResponse {
  count: number
  services: AwsService[]
}
