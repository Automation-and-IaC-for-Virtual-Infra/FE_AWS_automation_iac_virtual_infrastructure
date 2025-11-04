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

// interface service from database
export interface ServiceData {
  id: number
  name: string
  public_ip: string
  private_ip: string
  service_id: string
  status: number
  additional_information: string
  created_at: string
  updated_at: string
}
