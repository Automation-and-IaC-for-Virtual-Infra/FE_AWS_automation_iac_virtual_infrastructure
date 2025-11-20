'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ShimmeringText } from '@/components/ui/shadcn-io/shimmering-text'
import { ROUTES } from '@/constants/route'
import { useWebSocket } from '@/features/websocket/context/WebSocketContext'
import { cn } from '@/lib/utils'
import { SpecConnection, SpecResource } from '@/types/websocket'
import {
  AlertCircle,
  Brain,
  CheckCircle,
  CircleAlert,
  Loader2,
  RefreshCw,
  Rocket,
  Send,
  Sparkles,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { handleGetTerraformFiles } from '../libs/actions'
import { mappingInfraDataToReactFlow } from '../libs/utils'
import ModalWarning from './ModalWarning'
import { ValidationSteps } from './ValidationSteps'

interface InfrastructureChatProps {
  isOpen: boolean
  onClose: () => void
  onApplySuggestion?: (suggestion: any, sessionId: string) => void
  onGoToPreviewTerraform?: (sessionId: string, files?: any[], showDiff?: boolean) => void
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
  onGoToPreviewTerraform,
}: InfrastructureChatProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const processingRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [generatedSpec, setGeneratedSpec] = useState<InfraData | null>(null)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [isAutoFixed, setIsAutoFixed] = useState(false)

  const {
    messages,
    isConnected,
    isConnecting,
    error,
    sessionId,
    // disconnect,
    // clearMessages,
    generateSpec,
    connect,
    sendMessage,
    isProcessing,
    processingType,
    processingMessage,
    validateTerraform,
    autoFixTerraform,
    validationSteps,
  } = useWebSocket()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isProcessing, processingMessage, generatedSpec])

  useEffect(() => {
    if (processingRef.current) {
      processingRef.current.scrollTop = processingRef.current.scrollHeight
    }
  }, [processingMessage])

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
  }

  const handleClose = () => {
    setGeneratedSpec(null)
    onClose()
  }

  const handleApplySpec = (spec: InfraData) => {
    if (onApplySuggestion && sessionId) {
      onApplySuggestion(mappingInfraDataToReactFlow(spec), sessionId)
      toast.success('Infrastructure applied to diagram successfully!')
      setIsApplied(true)
      handleClose()
    }
  }

  const handleRequestClose = () => {
    setShowCloseConfirm(true)
  }

  const handleConfirmClose = () => {
    setShowCloseConfirm(false)
    handleClose()
    router.push(ROUTES.DASHBOARD)
  }

  const handleCancelClose = () => {
    setShowCloseConfirm(false)
  }

  const handleValidateTerraformClick = async () => {
    if (!sessionId) return
    try {
      await validateTerraform()
      setIsValidated(true)
    } catch {
      toast.error('Failed to validate Terraform files')
    }
  }

  const handleGoToPreviewFilesClick = async () => {
    if (!sessionId) return
    try {
      const res = await handleGetTerraformFiles(sessionId)
      if (res.success && res.files) {
        if (typeof onGoToPreviewTerraform === 'function') {
          onGoToPreviewTerraform(sessionId, res.files, false) // Pass false for showDiff
        }
      } else {
        toast.error('Failed to get terraform files')
      }
    } catch {
      toast.error('Failed to get terraform files')
    }
  }

  const handleAutoFixTerraformClick = async () => {
    if (!sessionId) return
    try {
      await autoFixTerraform()
      setIsAutoFixed(true)
    } catch {
      toast.error('Failed to auto fix Terraform files')
    }
  }

  const handleShowDiffClick = async (metadata: any) => {
    if (!sessionId) return
    try {
      const res = await handleGetTerraformFiles(sessionId)
      if (res.success && res.files) {
        // Pass the diff data to the preview modal
        if (typeof onGoToPreviewTerraform === 'function') {
          // Transform files to include diff information if available
          const filesWithDiff = res.files.map((file: any) => ({
            ...file,
            is_diff: metadata?.files?.some((f: any) => f.file_name === file.file_name) || false,
            diff: metadata?.files?.find((f: any) => f.file_name === file.file_name)?.diff || '',
          }))
          onGoToPreviewTerraform(sessionId, filesWithDiff, true) // Pass true for showDiff
        }
      } else {
        toast.error('Failed to get terraform files for diff')
      }
    } catch {
      toast.error('Failed to get terraform files for diff')
    }
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

  const _hasTerraformGenCompleted = messages.some(
    (msg) => msg.eventType === 'terraform:gen:completed'
  )

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
              onClick={handleRequestClose}
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
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-3 animate-fade-in w-[600px]">
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

                      {message.eventType === 'terraform:recommend_action' && (
                        <div className="space-y-4">
                          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-3 animate-fade-in min-w-[800px] max-w-[1000px]">
                            <div className="flex items-center gap-2 mb-2 text-red-700 dark:text-red-300">
                              <CircleAlert className="w-4 h-4" />
                              <span className="font-medium text-base">Validation result</span>
                            </div>

                            <ValidationSteps steps={validationSteps} />

                            <p className="text-sm text-red-900 dark:text-red-100 mb-3 whitespace-pre-wrap mt-2">
                              {/* {message.metadata?.message || message.content} */}
                              {/* TODO: hard code */}
                              Have some errors, do you want to auto fix?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                onClick={handleAutoFixTerraformClick}
                                disabled={isProcessing || !sessionId || isAutoFixed}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                              >
                                Auto fix
                              </Button>
                              <Button
                                onClick={handleGoToPreviewFilesClick}
                                disabled={!sessionId}
                                variant="outline"
                                className="flex-1"
                              >
                                Go to preview files
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Auto Fix Preview */}
                      {message.eventType === 'terraform:auto_fix:preview' && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-3 animate-fade-in w-[600px]">
                          <div className="flex items-center gap-2 mb-2 text-orange-700 dark:text-orange-300">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium text-base">Auto Fix Preview</span>
                          </div>
                          <p className="text-sm text-orange-900 dark:text-orange-100 mb-3 whitespace-pre-wrap">
                            {message.metadata?.message || message.content}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={() => handleShowDiffClick(message.metadata)}
                              disabled={isProcessing || !sessionId}
                              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              Show diff
                            </Button>
                            <Button
                              onClick={handleGoToPreviewFilesClick}
                              disabled={!sessionId}
                              variant="outline"
                              className="flex-1"
                            >
                              Go to preview files
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Ready to Generate */}
                      {message.eventType === 'chat:ready_to_generate' && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 animate-fade-in w-[600px]">
                          <div className="flex items-center gap-2 mb-3 text-green-700 dark:text-green-300">
                            <Rocket className="w-5 h-5" />
                            <span className="font-semibold">Ready to Generate!</span>
                          </div>
                          <p className="text-sm text-green-900 dark:text-green-100 mb-4">
                            {message.content}
                          </p>
                          <Button
                            onClick={handleGenerateSpec}
                            disabled={isProcessing || isApplied}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            size="lg"
                          >
                            {isApplied ? (
                              <>
                                <Rocket className="w-4 h-4 mr-2" />
                                Generated
                              </>
                            ) : isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Rocket className="w-4 h-4 mr-2" />
                                {isApplied ? 'Generated' : 'Generate Infrastructure'}
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {message.eventType === 'terraform:gen:completed' && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 animate-fade-in w-[600px] ">
                          <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300">
                            <Rocket className="w-5 h-5" />
                            <span className="font-semibold">Terraform files generated</span>
                          </div>
                          <p className="text-sm text-blue-900 dark:text-blue-100 mb-3 whitespace-pre-wrap">
                            {message.metadata?.message || message.content}
                          </p>
                          {Array.isArray(message.metadata?.file_names) && (
                            <div className="mb-3">
                              <span className="font-semibold">Files:</span>
                              <ul className="list-inside list-disc text-blue-900 dark:text-blue-100">
                                {message.metadata.file_names.map((file) => (
                                  <li key={file}>{file}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={handleValidateTerraformClick}
                              disabled={isProcessing || !sessionId || isValidated}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              {isValidated ? 'Validated' : 'Validate files'}
                            </Button>
                            <Button
                              onClick={handleGoToPreviewFilesClick}
                              variant="outline"
                              disabled={!sessionId}
                              className="flex-1"
                            >
                              Go to preview files
                            </Button>
                          </div>
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
            <div className="flex justify-start min-w-[600px] max-w-[1000px]">
              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-3 animate-fade-in opacity-70">
                <div className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
                  <Brain className="w-4 h-4 animate-pulse" />
                  <ShimmeringText
                    text={
                      processingType === 'spec'
                        ? 'Generating Infrastructure'
                        : processingType === 'terraform'
                          ? 'Validating Terraform Files'
                          : 'AI Assistant - Thinking'
                    }
                    duration={2}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: 'loop',
                      repeatDelay: 1,
                      ease: 'easeInOut',
                    }}
                  />
                </div>
                <div
                  ref={processingRef}
                  className="max-h-[400px] overflow-y-auto text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap dark:shadow-gray-800 min-w-[600px]"
                >
                  {processingMessage || 'Thinking...'}
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
                  disabled={isApplied}
                  onClick={() => handleApplySpec(generatedSpec)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isApplied ? 'Applied' : 'Apply to Diagram'}
                </Button>
              </CardContent>
            </Card>
          )}

          <div ref={messagesEndRef} />
        </div>

        {!_hasTerraformGenCompleted && (
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
        )}
      </div>

      {showCloseConfirm && (
        <ModalWarning onClose={handleCancelClose} onLeave={handleConfirmClose} />
      )}
    </div>
  )
}
