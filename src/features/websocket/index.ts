// Export all WebSocket-related components and utilities
export { wsService } from '../../lib/websocket-client'
export { useWebSocket, WebSocketProvider } from './context/WebSocketContext'

// Export types
export type {
  ChatClarificationPayload,
  ChatContentPayload,
  ChatErrorPayload,
  ChatMessage,
  ChatReadyToGeneratePayload,
  ChatRequest,
  ChatResponse,
  ChatThinkingPayload,
  GenerateSpecRequest,
  GenerateSpecResponse,
  PingMessage,
  SpecCompletedPayload,
  SpecContentPayload,
  SpecErrorPayload,
  SpecThinkingPayload,
  WebSocketConnectionState,
  WebSocketEventMap,
  WebSocketEventType,
  WebSocketMessage,
} from '../../types/websocket'
