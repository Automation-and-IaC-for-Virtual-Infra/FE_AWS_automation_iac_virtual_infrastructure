export interface StreamMessage {
  type:
    | 'session_created'
    | 'status'
    | 'thinking'
    | 'content'
    | 'clarification'
    | 'complete'
    | 'completed'
    | 'error'
    | 'ready_to_generate'
  session_id?: string
  status?:
    | 'analyzing'
    | 'processing'
    | 'generating'
    | 'complete'
    | 'completed'
    | 'ready_to_generate'
  message?: string
  token?: string
  accumulated_thought?: string
  accumulated?: string
  missing_info?: string[]
  error?: string
  spec?: any
}

export interface ParsedResponse {
  is_complete: boolean
  missing_info?: string[]
  clarification_question?: string
  suggestion?: {
    services: any[]
    connections: any[]
  }
}

// ✅ Add infrastructure spec type
export interface InfrastructureSpec {
  project: string
  region: string
  network: {
    vpc_cidr: string
    public_subnets: string[]
    private_app_subnets: string[]
  }
  security: {
    [key: string]: {
      description: string
      ingress_rules: Array<{
        protocol: string
        from_port: number
        to_port: number
        cidr_blocks: string[]
      }>
    }
  }
  ec2_instances: Array<{
    name: string
    instance_type: string
    ami: string
    subnet_type: string
    security_groups: string[]
  }>
}
