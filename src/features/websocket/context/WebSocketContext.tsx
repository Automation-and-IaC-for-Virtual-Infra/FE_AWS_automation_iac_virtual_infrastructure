'use client'

import { useWebSocketClient } from '@/hooks/useWebsocket'
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
  TerraformAutoFixPreviewPayload,
  TerraformGenCompletedPayload,
  TerraformGenFilePayload,
  TerraformRecommendActionPayload,
  TerraformSimpleMessagePayload,
  WebSocketConnectionState,
  WebSocketEventType,
} from '@/types/websocket'
import { generateUUID } from '@/utils/uuid'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface ValidationStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'success' | 'warning' | 'error'
  order: number
  details?: string
}

interface WebSocketContextType {
  connectionState: WebSocketConnectionState
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  sessionId: string | null
  messages: ChatMessage[]
  isProcessing: boolean
  processingType: 'chat' | 'spec' | 'terraform' | null
  processingMessage: string | null
  validationSteps: ValidationStep[]
  connect: (ws_url: string) => Promise<void>
  disconnect: () => void
  sendMessage: (prompt: string) => Promise<void>
  generateSpec: () => Promise<void>
  validateTerraform: () => Promise<void>
  autoFixTerraform: () => Promise<void>
  clearMessages: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingType, setProcessingType] = useState<'chat' | 'spec' | 'terraform' | null>(null)
  const [processingMessage, setProcessingMessage] = useState<string | null>(null)
  const [validationSteps, setValidationSteps] = useState<ValidationStep[]>([
    {
      id: 'terraform:init',
      name: 'Terraform Init',
      description: 'Initialize Terraform working directory',
      status: 'pending',
      order: 1,
    },
    {
      id: 'terraform:validate',
      name: 'Terraform Validate',
      description: 'Validate Terraform configuration files',
      status: 'pending',
      order: 2,
    },
    {
      id: 'terraform:tflint',
      name: 'TFLint',
      description: 'Run TFLint for Terraform best practices',
      status: 'pending',
      order: 3,
    },
    {
      id: 'terraform:checkov',
      name: 'Checkov',
      description: 'Run Checkov for security compliance',
      status: 'pending',
      order: 4,
    },
    {
      id: 'terraform:localstack',
      name: 'LocalStack Test',
      description: 'Test infrastructure with LocalStack',
      status: 'pending',
      order: 5,
    },
    {
      id: 'terraform:conftest',
      name: 'Conftest',
      description: 'Run policy validation with Conftest',
      status: 'pending',
      order: 6,
    },
  ])

  const wsClient = useWebSocketClient()
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>(
    wsClient.getConnectionState()
  )

  // Helper function to update validation step status
  const updateValidationStep = (
    stepId: string,
    status: ValidationStep['status'],
    details?: string
  ) => {
    setValidationSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status, details } : step))
    )
  }

  // Helper function to reset all validation steps
  const resetValidationSteps = () => {
    setValidationSteps((prev) =>
      prev.map((step) => ({ ...step, status: 'pending', details: undefined }))
    )
  }

  useEffect(() => {
    // Listen to connection state changes
    const handleConnectionChange = (state: WebSocketConnectionState) => {
      setConnectionState(state)
    }

    wsClient.addConnectionListener(handleConnectionChange)

    // Set up event listeners for all WebSocket events
    const eventListeners: Partial<Record<WebSocketEventType, (payload: any) => void>> = {
      // chat
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

      // gen spec
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

      // gen tf
      'terraform:gen:start': (payload: TerraformSimpleMessagePayload) => {
        setIsProcessing(true)
        setProcessingType('terraform')
        setProcessingMessage(payload.accumulated_thought || 'Generating Terraform files...')
      },
      'terraform:gen:file_generated': (payload: TerraformGenFilePayload) => {
        setProcessingMessage(payload.file_name)
      },
      'terraform:gen:localstack_file_generated': (payload: TerraformGenFilePayload) => {
        setProcessingMessage(payload.file_name)
      },
      'terraform:gen:completed': (payload: TerraformGenCompletedPayload) => {
        setIsProcessing(false)
        setProcessingType(null)
        setProcessingMessage(null)

        addMessage('assistant', 'Terraform files generated!', 'terraform:gen:completed', payload)
      },

      // validate tf
      'terraform:init:start': (payload: TerraformSimpleMessagePayload) => {
        setIsProcessing(true)
        setProcessingType('terraform')
        setProcessingMessage(payload.message || 'Initializing Terraform...')
        resetValidationSteps()
        updateValidationStep('terraform:init', 'running')
      },
      'terraform:init:completed': (payload: TerraformSimpleMessagePayload) => {
        const isSuccess = payload.result?.code === 0
        updateValidationStep(
          'terraform:init',
          isSuccess ? 'success' : 'error',
          payload.result?.stdout
        )
        setProcessingMessage(
          (prev) =>
            (prev + '\n' + payload.result.stdout || 'Initializing Terraform...') +
            '\n' +
            '--------------------' +
            '\n'
        )
      },
      'terraform:validate:start': (payload: TerraformSimpleMessagePayload) => {
        setProcessingMessage(
          (prev) => prev + '\n' + payload.message || 'Validating Terraform files...'
        )
        updateValidationStep('terraform:validate', 'running')
      },
      'terraform:validate:completed': (payload: TerraformSimpleMessagePayload) => {
        const isSuccess = payload.result?.code === 0
        updateValidationStep(
          'terraform:validate',
          isSuccess ? 'success' : 'error',
          payload.result?.stdout
        )
        setProcessingMessage(
          (prev) =>
            (prev + '\n' + payload.result.stdout || 'Validating Terraform files...') +
            '\n' +
            '--------------------' +
            '\n'
        )
      },
      'terraform:tflint:start': (payload: TerraformSimpleMessagePayload) => {
        setProcessingMessage((prev) => prev + '\n' + payload.message || 'Running TFLint...')
        updateValidationStep('terraform:tflint', 'running')
      },
      'terraform:tflint:completed': (payload: TerraformSimpleMessagePayload) => {
        const isSuccess = payload.result?.code === 0
        updateValidationStep(
          'terraform:tflint',
          isSuccess ? 'success' : 'warning',
          payload.result?.stdout
        )
        setProcessingMessage(
          (prev) =>
            (prev + '\n' + payload.result.stdout || 'Running TFLint...') +
            '\n' +
            '--------------------' +
            '\n'
        )
      },
      'terraform:checkov:start': (payload: TerraformSimpleMessagePayload) => {
        setProcessingMessage((prev) => prev + '\n' + payload.message || 'Running Checkov...')
        updateValidationStep('terraform:checkov', 'running')
      },
      'terraform:checkov:completed': (payload: TerraformSimpleMessagePayload) => {
        const isSuccess = payload.result?.code === 0
        updateValidationStep(
          'terraform:checkov',
          isSuccess ? 'success' : 'warning',
          payload.result?.stdout
        )
        setProcessingMessage(
          (prev) =>
            (prev + '\n' + payload.result.stdout || 'Running Checkov...') +
            '\n' +
            '--------------------' +
            '\n'
        )
      },
      'terraform:localstack:start': (payload: TerraformSimpleMessagePayload) => {
        setProcessingMessage((prev) => prev + '\n' + payload.message || 'Running LocalStack...')
        updateValidationStep('terraform:localstack', 'running')
      },
      'terraform:localstack:error': (payload: TerraformSimpleMessagePayload) => {
        updateValidationStep('terraform:localstack', 'error', payload.note)
        setProcessingMessage(
          (prev) =>
            (prev + '\n' + payload.note || 'Running LocalStack...') +
            '\n' +
            '--------------------' +
            '\n'
        )
      },
      'terraform:localstack:completed': (payload: TerraformSimpleMessagePayload) => {
        const isSuccess = payload.result?.code === 0
        updateValidationStep(
          'terraform:localstack',
          isSuccess ? 'success' : 'error',
          payload.result?.stdout
        )
        setProcessingMessage(
          (prev) =>
            (prev + '\n' + payload.result.stdout || 'Running LocalStack...') +
            '\n' +
            '--------------------' +
            '\n'
        )
      },
      'terraform:conftest:start': (payload: TerraformSimpleMessagePayload) => {
        setProcessingMessage((prev) => prev + '\n' + payload.message || 'Running Conftest...')
        updateValidationStep('terraform:conftest', 'running')
      },
      'terraform:conftest:completed': (payload: TerraformSimpleMessagePayload) => {
        const isSuccess = payload.result?.code === 0
        updateValidationStep(
          'terraform:conftest',
          isSuccess ? 'success' : 'warning',
          payload.result?.stdout
        )
        setProcessingMessage(
          (prev) =>
            (prev + '\n' + payload.result.stdout || 'Running Conftest...') +
            '\n' +
            '--------------------' +
            '\n'
        )
      },
      'terraform:recommend_action': (payload: TerraformRecommendActionPayload) => {
        setIsProcessing(false)
        setProcessingType(null)
        setProcessingMessage(null)

        addMessage('assistant', payload.message, 'terraform:recommend_action', payload)
      },

      // auto fix tf
      'terraform:auto_fix:start': (payload: TerraformSimpleMessagePayload) => {
        setIsProcessing(true)
        setProcessingType('terraform')
        setProcessingMessage(payload.message || 'Running auto fix...')
      },

      'terraform:auto_fix:validation_source': (payload: TerraformSimpleMessagePayload) => {
        setProcessingMessage(
          (prev) =>
            (prev + '\n' + payload.message || 'Running auto fix...') +
            '\n' +
            '--------------------' +
            '\n'
        )
      },
      'terraform:auto_fix:thinking': (payload: TerraformSimpleMessagePayload) => {
        setProcessingMessage(payload.accumulated_thought || 'Running auto fix...')
      },
      'terraform:auto_fix:content': (payload: TerraformSimpleMessagePayload) => {
        setProcessingMessage(payload.accumulated || 'Running auto fix...')
      },
      'terraform:auto_fix:preview': (payload: TerraformAutoFixPreviewPayload) => {
        setIsProcessing(false)
        setProcessingType(null)
        setProcessingMessage(null)

        addMessage('assistant', payload.message, 'terraform:auto_fix:preview', payload)
      },
    }

    // Register all event listeners
    Object.entries(eventListeners).forEach(([event, listener]) => {
      if (listener) {
        wsClient.addEventListener(event as WebSocketEventType, listener)
      }
    })

    return () => {
      wsClient.removeConnectionListener(handleConnectionChange)
      Object.entries(eventListeners).forEach(([event, listener]) => {
        if (listener) {
          wsClient.removeEventListener(event as WebSocketEventType, listener)
        }
      })
    }
  }, [wsClient])

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

  const connect = async (ws_url: string) => {
    try {
      if (!ws_url) {
        console.error('No WebSocket URL provided')
        return
      }

      // Generate new session ID when connecting
      const newSessionId = generateUUID()
      setCurrentSessionId(newSessionId)
      await wsClient.connect(newSessionId, ws_url)
    } catch (error) {
      console.error('Failed to connect:', error)
      throw error
    }
  }

  const disconnect = () => {
    wsClient.disconnect()
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

      setIsProcessing(true)
      const _response = await wsClient.sendChatMessage(prompt, currentSessionId)
    } catch (error) {
      console.error('Failed to send message:', error)
      addMessage(
        'assistant',
        `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      throw error
    }
  }

  const validateTerraform = async () => {
    try {
      if (!currentSessionId) {
        console.error('No active session. Please connect first.')
        return
      }

      setIsProcessing(true)
      resetValidationSteps()
      addMessage('user', 'Validate terraform')
      await wsClient.validateTerraform(currentSessionId)
    } catch (error) {
      console.error('Failed to validate terraform:', error)
      addMessage(
        'assistant',
        `Failed to validate Terraform: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      throw error
    }
  }

  const autoFixTerraform = async () => {
    try {
      if (!currentSessionId) {
        console.error('No active session. Please connect first.')
        return
      }

      setIsProcessing(true)
      addMessage('user', 'Auto fix terraform')
      await wsClient.autoFixTerraform(currentSessionId)
    } catch (error) {
      console.error('Failed to auto fix terraform:', error)
      addMessage(
        'assistant',
        `Failed to auto fix Terraform: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      await wsClient.generateSpec(currentSessionId)
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
    validationSteps,
    connect,
    disconnect,
    sendMessage,
    generateSpec,
    validateTerraform,
    autoFixTerraform,
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
