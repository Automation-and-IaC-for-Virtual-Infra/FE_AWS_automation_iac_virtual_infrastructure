export interface AwsServiceConnection {
  requiredConnections: string[]
  recommendedConnections: string[]
  optionalConnections: string[]
}

export interface AwsService {
  id: string
  _generatedId?: string
  resourceType: string
  displayName: string
  requiredProps: string[]
  connections: AwsServiceConnection
  properties?: Record<string, any>
}

export interface ListAwsServicesData {
  count: number
  services: AwsService[]
}
