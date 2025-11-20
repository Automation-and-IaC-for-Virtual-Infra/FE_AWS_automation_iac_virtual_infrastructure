import {
  handleAutoFixTerraform,
  handleChat,
  handleGenerateSpec,
  handleValidateTerraform,
} from '@/features/infrastructure/setup/libs/actions'
import { getURLBE } from '@/features/websocket/libs/fetchers'
import {
  PingMessage,
  WebSocketConnectionState,
  WebSocketEventType,
  WebSocketMessage,
} from '@/types/websocket'

let WS_BASE_URL = 'ws://localhost:8001'

// Fetch WebSocket configuration from server-side API
const fetchWebSocketConfig = async () => {
  try {
    const response = await getURLBE()
      console.log("🚀 ~ fetchWebSocketConfig ~ response:", response)
      WS_BASE_URL = response
  } catch (error) {
    console.error('Failed to fetch WebSocket config:', error)
  }
}

// Initialize config on module load
fetchWebSocketConfig()

export class WebSocketService {
  private ws: WebSocket | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 2
  private reconnectDelay = 1000
  private listeners: Map<WebSocketEventType, ((payload: any) => void)[]> = new Map()
  private connectionListeners: ((state: WebSocketConnectionState) => void)[] = []
  private connectionState: WebSocketConnectionState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    sessionId: null,
  }

  constructor() {
    // Initialize listeners for all event types
    const eventTypes: WebSocketEventType[] = [
      // chat
      'chat:thinking',
      'chat:content',
      'chat:clarification',
      'chat:ready_to_generate',
      'chat:error',

      // gen spec
      'spec:thinking',
      'spec:content',
      'spec:completed',
      'spec:error',

      // gen tf
      'terraform:gen:start',
      'terraform:gen:file_generated',
      'terraform:gen:localstack_file_generated',
      'terraform:gen:completed',

      // validate tf
      'terraform:init:start',
      'terraform:init:completed',
      'terraform:validate:start',
      'terraform:validate:completed',
      'terraform:tflint:start',
      'terraform:tflint:completed',
      'terraform:checkov:start',
      'terraform:checkov:completed',
      'terraform:localstack:start',
      'terraform:localstack:starting',
      'terraform:localstack:error',
      'terraform:localstack:completed',
      'terraform:conftest:start',
      'terraform:conftest:completed',
      'terraform:recommend_action',

      // auto fix tf
      'terraform:auto_fix:start',
      'terraform:auto_fix:validation_source',
      'terraform:auto_fix:thinking',
      'terraform:auto_fix:content',
      'terraform:auto_fix:preview',
      'terraform:auto_fix:completed',
    ]

    eventTypes.forEach((type) => {
      this.listeners.set(type, [])
    })
  }

  connect(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      this.updateConnectionState({
        ...this.connectionState,
        isConnecting: true,
        error: null,
      })

      const wsUrl = `${WS_BASE_URL}/ws?jobId=${sessionId}`

      try {
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.updateConnectionState({
            isConnected: true,
            isConnecting: false,
            error: null,
            sessionId,
          })
          this.reconnectAttempts = 0
          this.startPingInterval()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage | PingMessage = JSON.parse(event.data)

            if ('type' in message && message.type === 'ping') {
              this.sendPong()
              return
            }

            if ('event' in message) {
              this.handleMessage(message as WebSocketMessage)
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.updateConnectionState({
            isConnected: false,
            isConnecting: false,
            error: null,
            sessionId: null,
          })
          this.stopPingInterval()
          this.handleReconnect(sessionId)
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.updateConnectionState({
            ...this.connectionState,
            isConnecting: false,
            error: 'Connection error',
          })
          reject(error)
        }
      } catch (error) {
        this.updateConnectionState({
          ...this.connectionState,
          isConnecting: false,
          error: 'Failed to create WebSocket connection',
        })
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.stopPingInterval()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.updateConnectionState({
      isConnected: false,
      isConnecting: false,
      error: null,
      sessionId: null,
    })
  }

  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.event)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(message.payload)
        } catch (error) {
          console.error(`Error in listener for ${message.event}:`, error)
        }
      })
    }
  }

  private sendPong(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'pong' }))
    }
  }

  private startPingInterval(): void {
    this.stopPingInterval()
    // Server sends ping every 20 seconds, we don't need to send ping
    // but we'll monitor connection health
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private handleReconnect(sessionId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      )

      setTimeout(() => {
        this.connect(sessionId).catch((error) => {
          console.error('Reconnection failed:', error)
        })
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
      this.updateConnectionState({
        ...this.connectionState,
        error: 'Failed to reconnect after multiple attempts',
      })
    }
  }

  private updateConnectionState(newState: WebSocketConnectionState): void {
    this.connectionState = newState
    this.connectionListeners.forEach((listener) => {
      try {
        listener(newState)
      } catch (error) {
        console.error('Error in connection listener:', error)
      }
    })
  }

  // Event listener management
  addEventListener(event: WebSocketEventType, listener: (payload: any) => void): void {
    const listeners = this.listeners.get(event) || []
    listeners.push(listener)
    this.listeners.set(event, listeners)
  }

  removeEventListener(event: WebSocketEventType, listener: (payload: any) => void): void {
    const listeners = this.listeners.get(event) || []
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
      this.listeners.set(event, listeners)
    }
  }

  addConnectionListener(listener: (state: WebSocketConnectionState) => void): void {
    this.connectionListeners.push(listener)
  }

  removeConnectionListener(listener: (state: WebSocketConnectionState) => void): void {
    const index = this.connectionListeners.indexOf(listener)
    if (index > -1) {
      this.connectionListeners.splice(index, 1)
    }
  }

  getConnectionState(): WebSocketConnectionState {
    return { ...this.connectionState }
  }

  // HTTP API methods
  async sendChatMessage(prompt: string, session_id: string): Promise<{ session_id: string }> {
    const response = await handleChat(prompt, session_id)

    return response
  }

  async generateSpec(session_id: string): Promise<{ session_id: string }> {
    const response = await handleGenerateSpec(session_id)

    return response
  }

  async validateTerraform(session_id: string): Promise<any> {
    const response = await handleValidateTerraform(session_id)

    return response
  }

  async autoFixTerraform(session_id: string): Promise<any> {
    const response = await handleAutoFixTerraform(session_id)

    return response
  }
}

// Singleton instance
export const wsService = new WebSocketService()
