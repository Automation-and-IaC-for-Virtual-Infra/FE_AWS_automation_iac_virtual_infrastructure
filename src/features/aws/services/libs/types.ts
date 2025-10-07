export interface AwsServiceConnection {
  requiredConnections: string[]
  recommendedConnections: string[]
  optionalConnections: string[]
}

export interface AwsService {
  id: string
  resourceType: string
  displayName: string
  requiredProps: string[]
  connections: AwsServiceConnection
  properties?: Record<string, any>
}

export interface ListAwsServicesResponse {
  count: number
  services: AwsService[]
}
