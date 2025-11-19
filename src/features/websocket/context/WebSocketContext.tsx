'use client'

import { wsService } from '@/lib/websocket-client'
import {
  ChatClarificationPayload,
  ChatContentPayload,
  ChatErrorPayload,
  ChatMessage,
  ChatReadyToGeneratePayload,
  ChatThinkingPayload,
  SpecCompletedPayload,
  SpecContentPayload,
  SpecThinkingPayload,
  WebSocketConnectionState,
  WebSocketEventType,
} from '@/types/websocket'
import { generateUUID } from '@/utils/uuid'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface WebSocketContextType {
  connectionState: WebSocketConnectionState
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  sessionId: string | null
  messages: ChatMessage[]
  isProcessing: boolean
  processingType: 'chat' | 'spec' | null
  processingMessage: string | null
  connect: () => Promise<void>
  disconnect: () => void
  sendMessage: (prompt: string) => Promise<void>
  generateSpec: () => Promise<void>
  clearMessages: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>(
    wsService.getConnectionState()
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingType, setProcessingType] = useState<'chat' | 'spec' | null>(null)
  const [processingMessage, setProcessingMessage] = useState<string | null>(null)

  useEffect(() => {
    // Listen to connection state changes
    const handleConnectionChange = (state: WebSocketConnectionState) => {
      setConnectionState(state)
    }

    wsService.addConnectionListener(handleConnectionChange)

    // Set up event listeners for all WebSocket events
    const eventListeners: Partial<Record<WebSocketEventType, (payload: any) => void>> = {
      'chat:thinking': (payload: ChatThinkingPayload) => {
        setIsProcessing(true)
        setProcessingType('chat')
        setProcessingMessage(payload.accumulated_thought || 'AI is thinking...')
      },
      'chat:content': (payload: ChatContentPayload) => {
        setProcessingMessage(payload.accumulated)
      },
      'chat:clarification': (payload: ChatClarificationPayload) => {
        setIsProcessing(false)
        setProcessingType(null)
        setProcessingMessage(null)

        const content = payload.message
        addMessage('assistant', content, 'chat:clarification', payload)
      },
      'chat:ready_to_generate': (payload: ChatReadyToGeneratePayload) => {
        setIsProcessing(false)
        setProcessingType(null)
        setProcessingMessage(null)

        addMessage(
          'assistant',
          payload.message || 'Ready to generate infrastructure specification',
          'chat:ready_to_generate',
          payload
        )
      },
      'chat:error': (payload: ChatErrorPayload) => {
        // Clear processing state and add error message
        setIsProcessing(false)
        setProcessingType(null)
        setProcessingMessage(null)

        addMessage(
          'assistant',
          `Error: ${payload.error}${payload.details ? `\n\nDetails: ${payload.details}` : ''}`,
          'chat:error',
          payload
        )
      },
      'spec:thinking': (payload: SpecThinkingPayload) => {
        setIsProcessing(true)
        setProcessingType('spec')
        setProcessingMessage(payload.accumulated_thought || 'Generating specification...')
      },
      'spec:content': (payload: SpecContentPayload) => {
        setProcessingMessage(payload.accumulated)
      },
      'spec:completed': (payload: SpecCompletedPayload) => {
        setIsProcessing(false)
        setProcessingType(null)
        setProcessingMessage(null)

        addMessage('assistant', 'Specification generation completed!', 'spec:completed', payload)
      },
      'spec:error': (payload) => {
        setIsProcessing(false)
        setProcessingType(null)
        setProcessingMessage(null)

        addMessage(
          'assistant',
          `Specification Error: ${payload.error}${payload.details ? `\n\nDetails: ${payload.details}` : ''}`,
          'spec:error',
          payload
        )
      },
    }

    // Register all event listeners
    Object.entries(eventListeners).forEach(([event, listener]) => {
      if (listener) {
        wsService.addEventListener(event as WebSocketEventType, listener)
      }
    })

    return () => {
      wsService.removeConnectionListener(handleConnectionChange)
      Object.entries(eventListeners).forEach(([event, listener]) => {
        if (listener) {
          wsService.removeEventListener(event as WebSocketEventType, listener)
        }
      })
    }
  }, [])

  const addMessage = (
    type: 'user' | 'assistant',
    content: string,
    eventType?: WebSocketEventType,
    metadata?: Record<string, any>
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date(),
      eventType,
      metadata,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const connect = async () => {
    try {
      // Generate new session ID when connecting
      const newSessionId = generateUUID()
      setCurrentSessionId(newSessionId)
      await wsService.connect(newSessionId)
    } catch (error) {
      console.error('Failed to connect:', error)
      throw error
    }
  }

  const disconnect = () => {
    wsService.disconnect()
    // Clear session ID when disconnecting
    setCurrentSessionId(null)
  }

  const sendMessage = async (prompt: string) => {
    try {
      addMessage('user', prompt)

      // Use current session ID, if none exists, connect first
      if (!currentSessionId) {
        console.error('No active session. Please connect first.')
        return
      }

      const _response = await wsService.sendChatMessage(prompt, currentSessionId)
    } catch (error) {
      console.error('Failed to send message:', error)
      addMessage(
        'assistant',
        `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      throw error
    }
  }

  const generateSpec = async () => {
    try {
      if (!currentSessionId) {
        console.error('No active session. Please connect first.')
        return
      }

      setIsProcessing(true)
      addMessage('user', 'Generate infrastructure specification')
      await wsService.generateSpec(currentSessionId)
    } catch (error) {
      console.error('Failed to generate spec:', error)
      addMessage(
        'assistant',
        `Failed to generate specification: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      throw error
    }
  }

  const clearMessages = () => {
    setMessages([])
    setIsProcessing(false)
    setProcessingType(null)
    setProcessingMessage(null)
  }

  const value: WebSocketContextType = {
    connectionState,
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    error: connectionState.error,
    sessionId: currentSessionId,
    messages,
    isProcessing,
    processingType,
    processingMessage,
    connect,
    disconnect,
    sendMessage,
    generateSpec,
    clearMessages,
  }

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}
