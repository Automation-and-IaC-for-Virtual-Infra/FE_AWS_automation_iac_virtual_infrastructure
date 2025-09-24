export interface AwsService {
  id: string
  resourceType: string
  displayName: string
  config: Record<string, any>
  connectedTo: string[]
}

export interface ListAwsServicesResponse {
  count: number
  services: AwsService[]
}
