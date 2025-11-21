import {
  handleAutoFixTerraform,
  handleChat,
  handleGenerateSpec,
  handleValidateTerraform,
} from '@/features/infrastructure/setup/libs/actions'
import { WebSocketConnectionState, WebSocketEventType, WebSocketMessage } from '@/types/websocket'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseWebSocketClientReturn {
  connect: (sessionId: string, ws_url: string) => Promise<void>
  disconnect: () => void
  addEventListener: (event: WebSocketEventType, listener: (payload: any) => void) => void
  removeEventListener: (event: WebSocketEventType, listener: (payload: any) => void) => void
  addConnectionListener: (listener: (state: WebSocketConnectionState) => void) => void
  removeConnectionListener: (listener: (state: WebSocketConnectionState) => void) => void
  getConnectionState: () => WebSocketConnectionState
  sendChatMessage: (prompt: string, session_id: string) => Promise<{ session_id: string }>
  generateSpec: (session_id: string) => Promise<{ session_id: string }>
  validateTerraform: (session_id: string) => Promise<any>
  autoFixTerraform: (session_id: string) => Promise<any>
}

export function useWebSocketClient(): UseWebSocketClientReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const listenersRef = useRef<Map<WebSocketEventType, ((payload: any) => void)[]>>(new Map())
  const connectionListenersRef = useRef<((state: WebSocketConnectionState) => void)[]>([])
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    sessionId: null,
  })

  // Initialize listeners for all event types
  useEffect(() => {
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

    const listeners = listenersRef.current
    eventTypes.forEach((type) => {
      if (!listeners.has(type)) {
        listeners.set(type, [])
      }
    })
  }, [])

  const updateConnectionState = useCallback((newState: WebSocketConnectionState) => {
    setConnectionState(newState)
    connectionListenersRef.current.forEach((listener) => {
      try {
        listener(newState)
      } catch (error) {
        console.error('Error in connection listener:', error)
      }
    })
  }, [])

  const handleMessage = useCallback((message: WebSocketMessage) => {
    const listeners = listenersRef.current.get(message.event)
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(message.payload)
        } catch (error) {
          console.error(`Error in listener for ${message.event}:`, error)
        }
      })
    }
  }, [])

  // Forward declaration of connect to avoid circular dependency
  const connect = useCallback(
    (sessionId: string, ws_url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          resolve()
          return
        }

        updateConnectionState({
          ...connectionState,
          isConnecting: true,
          error: null,
        })

        const wsUrl = `${ws_url}/ws?jobId=${sessionId}`

        try {
          wsRef.current = new WebSocket(wsUrl)

          const ws = wsRef.current

          ws.onopen = () => {
            console.log('WebSocket connected')
            updateConnectionState({
              isConnected: true,
              isConnecting: false,
              error: null,
              sessionId,
            })
            resolve()
          }

          ws.onmessage = (event) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data)

              if ('type' in message && message.type === 'ping') {
                return
              }

              if ('event' in message) {
                handleMessage(message as WebSocketMessage)
              }
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error)
            }
          }

          ws.onclose = () => {
            console.log('WebSocket disconnected')
            updateConnectionState({
              isConnected: false,
              isConnecting: false,
              error: null,
              sessionId: null,
            })
          }

          ws.onerror = (error: Event) => {
            console.error('WebSocket error:', error)
            updateConnectionState({
              ...connectionState,
              isConnecting: false,
              error: 'Connection error',
            })
            reject(error)
          }
        } catch (error: unknown) {
          updateConnectionState({
            ...connectionState,
            isConnecting: false,
            error: 'Failed to create WebSocket connection',
          })
          reject(error)
        }
      })
    },
    [connectionState, updateConnectionState, handleMessage]
  )

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    updateConnectionState({
      isConnected: false,
      isConnecting: false,
      error: null,
      sessionId: null,
    })
  }, [updateConnectionState])

  const addEventListener = useCallback(
    (event: WebSocketEventType, listener: (payload: any) => void) => {
      const listeners = listenersRef.current.get(event) || []
      listeners.push(listener)
      listenersRef.current.set(event, listeners)
    },
    []
  )

  const removeEventListener = useCallback(
    (event: WebSocketEventType, listener: (payload: any) => void) => {
      const listeners = listenersRef.current.get(event) || []
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
        listenersRef.current.set(event, listeners)
      }
    },
    []
  )

  const addConnectionListener = useCallback(
    (listener: (state: WebSocketConnectionState) => void) => {
      connectionListenersRef.current.push(listener)
    },
    []
  )

  const removeConnectionListener = useCallback(
    (listener: (state: WebSocketConnectionState) => void) => {
      const index = connectionListenersRef.current.indexOf(listener)
      if (index > -1) {
        connectionListenersRef.current.splice(index, 1)
      }
    },
    []
  )

  const getConnectionState = useCallback(() => {
    return { ...connectionState }
  }, [connectionState])

  const sendChatMessage = useCallback(
    async (prompt: string, session_id: string): Promise<{ session_id: string }> => {
      const response = await handleChat(prompt, session_id)
      return response
    },
    []
  )

  const generateSpec = useCallback(async (session_id: string): Promise<{ session_id: string }> => {
    const response = await handleGenerateSpec(session_id)
    return response
  }, [])

  const validateTerraform = useCallback(async (session_id: string): Promise<any> => {
    const response = await handleValidateTerraform(session_id)
    return response
  }, [])

  const autoFixTerraform = useCallback(async (session_id: string): Promise<any> => {
    const response = await handleAutoFixTerraform(session_id)
    return response
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    disconnect,
    addEventListener,
    removeEventListener,
    addConnectionListener,
    removeConnectionListener,
    getConnectionState,
    sendChatMessage,
    generateSpec,
    validateTerraform,
    autoFixTerraform,
  }
}
