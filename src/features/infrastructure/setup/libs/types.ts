export type InfraService = {
  type: string
  resourceType: string
  name: string
  config: Record<string, any>
}

export type InfraResource = {
  id: string
  type: string
  name: string | null
  properties: Record<string, any>
}

export type InfraConnection = {
  id: string
  source: string
  target: string
}

export type InfraData = {
  project: string
  region: string
  resources: InfraResource[]
  connections: InfraConnection[]
}
