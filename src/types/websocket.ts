export interface WebSocketMessage {
  job_id: string
  event: WebSocketEventType
  payload: Record<string, any>
}

export interface PingMessage {
  type: 'ping'
}

export type WebSocketEventType =
  // Chat events
  | 'chat:thinking'
  | 'chat:content'
  | 'chat:clarification'
  | 'chat:ready_to_generate'
  | 'chat:error'
  // Spec events
  | 'spec:thinking'
  | 'spec:content'
  | 'spec:completed'
  | 'spec:error'
  // Terraform generate events
  | 'terraform:gen:start'
  | 'terraform:gen:file_generated'
  | 'terraform:gen:localstack_file_generated'
  | 'terraform:gen:completed'
  // Terraform validate events
  | 'terraform:init:start'
  | 'terraform:init:completed'
  | 'terraform:validate:start'
  | 'terraform:validate:completed'
  | 'terraform:tflint:start'
  | 'terraform:tflint:completed'
  | 'terraform:checkov:start'
  | 'terraform:checkov:completed'
  | 'terraform:localstack:start'
  | 'terraform:localstack:starting'
  | 'terraform:localstack:error'
  | 'terraform:localstack:completed'
  | 'terraform:conftest:start'
  | 'terraform:conftest:completed'
  | 'terraform:recommend_action'
  // Terraform auto-fix events
  | 'terraform:auto_fix:start'
  | 'terraform:auto_fix:validation_source'
  | 'terraform:auto_fix:thinking'
  | 'terraform:auto_fix:content'
  | 'terraform:auto_fix:preview'
  | 'terraform:auto_fix:completed'

export interface ChatThinkingPayload {
  accumulated_thought: string
  token: string
}

export interface ChatContentPayload {
  accumulated: string
  token: string
}

export interface ChatClarificationPayload {
  message: string
  missing_info: string[]
  status: string
}

export interface ChatReadyToGeneratePayload {
  message: string
  session_id: string
  status: string
}

export interface ChatErrorPayload {
  error: string
  details?: string
}

export interface SpecThinkingPayload {
  accumulated_thought: string
  token: string
}

export interface SpecContentPayload {
  accumulated: string
  token: string
}

export interface TerraformGenFilePayload {
  file_name: string
  file_index: number
  total_files: number
  progress: string
}

export interface TerraformGenCompletedPayload {
  message: string
  files_generated: number
  file_names: string[]
  localstack_files_generated: number
  localstack_file_names: string[]
}

export interface TerraformCommandResult {
  cmd: string
  code: number
  stdout: string
  stderr?: string
}

export interface TerraformCommandCompletedPayload {
  result: TerraformCommandResult
}

export interface TerraformSimpleMessagePayload {
  message: string
  [key: string]: any
}

export interface TerraformRecommendActionPayload {
  message: string
  action?: string
}

export interface TerraformAutoFixFileDiffChunk {
  op: string
  text: string
}

export interface TerraformAutoFixFileChange {
  file_name: string
  patch: string
  diff: TerraformAutoFixFileDiffChunk[]
  original_content: string
  proposed_content: string
  reason: string
  has_changes: boolean
}

export interface TerraformAutoFixPreviewPayload {
  message: string
  files: TerraformAutoFixFileChange[]
  summary: string
  validation_summary: any[]
}

export interface SpecResource {
  id: string
  type: string
  name: string
  properties: Record<string, any>
}

export interface SpecConnection {
  id: string
  source: string
  target: string
}

export interface SpecData {
  project: string
  region: string
  resources: SpecResource[]
  connections: SpecConnection[]
}

export interface SpecCompletedPayload {
  status: string
  message: string
  spec: SpecData
}

export interface SpecErrorPayload {
  error: string
  details?: string
}

export interface WebSocketEventMap {
  // chat
  'chat:thinking': ChatThinkingPayload
  'chat:content': ChatContentPayload
  'chat:clarification': ChatClarificationPayload
  'chat:ready_to_generate': ChatReadyToGeneratePayload
  'chat:error': ChatErrorPayload

  // gen spec
  'spec:thinking': SpecThinkingPayload
  'spec:content': SpecContentPayload
  'spec:completed': SpecCompletedPayload
  'spec:error': SpecErrorPayload

  // gen tf
  'terraform:gen:start': TerraformSimpleMessagePayload
  'terraform:gen:file_generated': TerraformGenFilePayload
  'terraform:gen:localstack_file_generated': TerraformGenFilePayload
  'terraform:gen:completed': TerraformGenCompletedPayload

  // validate tf
  'terraform:init:start': TerraformSimpleMessagePayload
  'terraform:init:completed': TerraformCommandCompletedPayload
  'terraform:validate:start': TerraformSimpleMessagePayload
  'terraform:validate:completed': TerraformCommandCompletedPayload
  'terraform:tflint:start': TerraformSimpleMessagePayload
  'terraform:tflint:completed': TerraformCommandCompletedPayload
  'terraform:checkov:start': TerraformSimpleMessagePayload
  'terraform:checkov:completed': TerraformCommandCompletedPayload
  'terraform:localstack:start': TerraformSimpleMessagePayload
  'terraform:localstack:starting': TerraformSimpleMessagePayload
  'terraform:localstack:error': { error: string; note?: string }
  'terraform:localstack:completed': TerraformCommandCompletedPayload
  'terraform:conftest:start': TerraformSimpleMessagePayload
  'terraform:conftest:completed': TerraformCommandCompletedPayload
  'terraform:recommend_action': TerraformRecommendActionPayload

  // auto fix tf
  'terraform:auto_fix:start': TerraformSimpleMessagePayload
  'terraform:auto_fix:validation_source': { source: string; message: string }
  'terraform:auto_fix:thinking': { token: string; accumulated_thought: string }
  'terraform:auto_fix:content': { token: string; accumulated: string }
  'terraform:auto_fix:preview': TerraformAutoFixPreviewPayload
  'terraform:auto_fix:completed': { status: string; file_count: number }
}

export interface ChatRequest {
  prompt: string
  session_id?: string | null
}

export interface ChatResponse {
  status: 'started'
  session_id: string
  message: string
}

export interface GenerateSpecRequest {
  session_id: string
}

export interface GenerateSpecResponse {
  status: 'started'
  session_id: string
  message: string
}

export interface WebSocketConnectionState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  sessionId: string | null
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  eventType?: WebSocketEventType
  metadata?: Record<string, any>
}
