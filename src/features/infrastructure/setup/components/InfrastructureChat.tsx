'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/route'
import { useWebSocket } from '@/features/websocket/context/WebSocketContext'
import { cn } from '@/lib/utils'
import { SpecConnection, SpecResource } from '@/types/websocket'
import {
  AlertCircle,
  Brain,
  CheckCircle,
  Loader2,
  RefreshCw,
  Rocket,
  Send,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { mappingInfraDataToReactFlow } from '../libs/utils'

interface InfrastructureChatProps {
  isOpen: boolean
  onClose: () => void
  onApplySuggestion?: (suggestion: any, sessionId: string) => void
}

interface InfraData {
  project: string
  region: string
  resources: SpecResource[]
  connections: SpecConnection[]
}

export function InfrastructureChat({
  isOpen,
  onClose,
  onApplySuggestion,
}: InfrastructureChatProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [generatedSpec, setGeneratedSpec] = useState<InfraData | null>(null)

  const {
    messages,
    isConnected,
    isConnecting,
    error,
    sessionId,
    disconnect,
    clearMessages,
    generateSpec,
    connect,
    sendMessage,
    isProcessing,
    processingType,
    processingMessage,
  } = useWebSocket()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isProcessing, processingMessage, generatedSpec])

  const handleConnect = async () => {
    try {
      await connect()
      toast.success('Connected to Infrastructure Assistant')
    } catch {
      toast.error('Failed to connect to Infrastructure Assistant')
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return
    await sendMessage(input)
    setInput('')
  }

  const handleGenerateSpec = async () => {
    try {
      setGeneratedSpec(null)
      await generateSpec()
    } catch {
      toast.error('Failed to generate infrastructure specification')
    }
  }

  const handleRetry = async () => {
    await sendMessage('Retry')
    // handleGenerateSpec()
  }

  const handleApplySpec = (spec: InfraData) => {
    if (onApplySuggestion && sessionId) {
      onApplySuggestion(mappingInfraDataToReactFlow(spec), sessionId)
      toast.success('Infrastructure applied to diagram successfully!')
      handleClose()
    }
  }

  const handleClose = () => {
    disconnect()
    clearMessages()
    setGeneratedSpec(null)
    onClose()
  }

  const getConnectionStatus = () => {
    if (isConnecting) return { status: 'Connecting', color: 'secondary', icon: Loader2 }
    if (isConnected) return { status: 'Connected', color: 'default', icon: Wifi }
    return { status: 'Disconnected', color: 'destructive', icon: WifiOff }
  }

  const connectionStatus = getConnectionStatus()
  const StatusIcon = connectionStatus.icon

  // Check if there's a ready_to_generate message
  const _hasReadyToGenerate = messages.some((msg) => msg.eventType === 'chat:ready_to_generate')

  // Check if there's a completed spec
  const completedMessage = messages.find((msg) => msg.eventType === 'spec:completed')
  const _errorMessage = messages.find(
    (msg) => msg.eventType === 'spec:error' || msg.eventType === 'chat:error'
  )

  // Update generated spec when completed
  useEffect(() => {
    if (completedMessage?.metadata?.spec) {
      setGeneratedSpec(completedMessage.metadata.spec as InfraData)
    }
  }, [completedMessage])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 flex flex-col size-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Infrastructure Assistant</h2>
          <div className="flex items-center gap-3">
            <Badge variant={connectionStatus.color as any} className="text-xs">
              <div className="flex items-center gap-1">
                {connectionStatus.icon === Loader2 ? (
                  <StatusIcon className="h-3 w-3 animate-spin" />
                ) : (
                  <StatusIcon className="h-3 w-3" />
                )}
                <span>{connectionStatus.status}</span>
              </div>
            </Badge>
            {sessionId && (
              <Badge variant="outline" className="text-xs text-white">
                Session: {sessionId.slice(0, 8)}...
              </Badge>
            )}
            <button
              onClick={() => router.push(ROUTES.DASHBOARD)}
              className="p-2 rounded-md hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.filter(
            (message) =>
              !['chat:thinking', 'chat:content', 'spec:thinking', 'spec:content'].includes(
                message.eventType || ''
              )
          ).length === 0 &&
            !isProcessing && (
              <div className="text-center text-gray-500 dark:text-gray-300 mt-20 space-y-5">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <p className="text-xl font-semibold">Welcome to Infrastructure Assistant!</p>
                <p className="text-sm leading-relaxed max-w-sm mx-auto text-gray-600 dark:text-gray-400">
                  {isConnected
                    ? "Describe your infrastructure requirements and I'll help you design and generate the specifications."
                    : 'Connect to start designing your cloud infrastructure with AI assistance.'}
                </p>
                {!isConnected && (
                  <Button onClick={handleConnect} disabled={isConnecting} className="mt-4">
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wifi className="w-4 h-4 mr-2" />
                        Connect to Assistant
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

          {/* Messages */}
          {messages
            .filter(
              (message) =>
                !['chat:thinking', 'chat:content', 'spec:thinking', 'spec:content'].includes(
                  message.eventType || ''
                )
            )
            .map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.type === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div className={cn('max-w-[80%] space-y-2')}>
                  {/* User Message */}
                  {message.type === 'user' && (
                    <div className="bg-blue-600 text-white rounded-lg p-3 animate-fade-in">
                      <div className="text-sm">{message.content}</div>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {/* Assistant Messages */}
                  {message.type === 'assistant' && (
                    <>
                      {/* Clarification */}
                      {message.eventType === 'chat:clarification' && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 animate-fade-in">
                          <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-300">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium text-sm">Need More Information</span>
                          </div>
                          <p className="text-sm text-amber-900 dark:text-amber-100 mb-3">
                            {message.content}
                          </p>
                          {message.metadata?.missing_info?.length > 0 && (
                            <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/40 rounded text-xs">
                              <p className="font-medium mb-1">Missing:</p>
                              <ul className="space-y-1">
                                {message?.metadata?.missing_info?.map(
                                  (info: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-1">
                                      <span className="w-1 h-1 bg-amber-600 rounded-full" />
                                      {info.replace('_', ' ')}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ready to Generate */}
                      {message.eventType === 'chat:ready_to_generate' && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 animate-fade-in">
                          <div className="flex items-center gap-2 mb-3 text-green-700 dark:text-green-300">
                            <Rocket className="w-5 h-5" />
                            <span className="font-semibold">Ready to Generate!</span>
                          </div>
                          <p className="text-sm text-green-900 dark:text-green-100 mb-4">
                            {message.content}
                          </p>
                          <Button
                            onClick={handleGenerateSpec}
                            disabled={isProcessing}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            size="lg"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Rocket className="w-4 h-4 mr-2" />
                                Generate Infrastructure
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Error Messages */}
                      {(message.eventType === 'chat:error' ||
                        message.eventType === 'spec:error') && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-fade-in">
                          <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-300">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium text-sm">Error</span>
                          </div>
                          <p className="text-sm text-red-900 dark:text-red-100 mb-3">
                            {message.content}
                          </p>
                          {message.eventType === 'spec:error' && (
                            <Button
                              onClick={handleRetry}
                              disabled={isProcessing}
                              variant="outline"
                              size="sm"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Retry
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Regular Assistant Message */}
                      {!message.eventType && (
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg p-3 animate-fade-in">
                          <div className="text-sm">{message.content}</div>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 animate-fade-in opacity-70">
                  <div className="flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-300">
                    <Brain className="w-4 h-4 animate-pulse" />
                    <span className="font-medium text-sm">
                      {processingType === 'spec' ? 'Generating Infrastructure' : 'AI Assistant'}
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 whitespace-pre-wrap animate-pulse">
                    {processingMessage || 'Thinking...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generated Spec Preview */}
          {generatedSpec && (
            <Card className="border-2 border-green-500 max-w-[800px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  Infrastructure Specification Generated
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Project</p>
                    <p className="font-medium">{generatedSpec.project}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Region</p>
                    <p className="font-medium">{generatedSpec.region}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Resources</p>
                    <p className="font-medium">{generatedSpec.resources.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Connections</p>
                    <p className="font-medium">{generatedSpec.connections.length}</p>
                  </div>
                </div>

                {/* Resources List */}
                <div>
                  <p className="text-sm font-semibold mb-2">Resources:</p>
                  <div className="space-y-1">
                    {generatedSpec.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center gap-2 text-sm px-2 py-1 bg-gray-50 rounded"
                      >
                        <span className="font-mono text-xs text-gray-500">{resource.id}</span>
                        <span className="font-medium">{resource.name || resource.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {resource.type.split('::').pop()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <Button
                  onClick={() => handleApplySpec(generatedSpec)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Apply to Diagram
                </Button>
              </CardContent>
            </Card>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Describe your infrastructure needs..."
              disabled={!isConnected || isProcessing}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!isConnected || isProcessing || !input.trim()}>
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
