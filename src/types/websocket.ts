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
  'chat:thinking': ChatThinkingPayload
  'chat:content': ChatContentPayload
  'chat:clarification': ChatClarificationPayload
  'chat:ready_to_generate': ChatReadyToGeneratePayload
  'chat:error': ChatErrorPayload
  'spec:thinking': SpecThinkingPayload
  'spec:content': SpecContentPayload
  'spec:completed': SpecCompletedPayload
  'spec:error': SpecErrorPayload
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
