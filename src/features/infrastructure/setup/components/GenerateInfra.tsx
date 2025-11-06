'use client'

import { MessageContent } from '@/components/chat/MessageContent'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/route'
import { useInfrastructureChat } from '@/hooks/useInfrastructureChat'
import { cn } from '@/lib/utils'
import { cx } from 'class-variance-authority'
import { AlertCircle, Brain, CheckCircle, Loader2, Rocket, Search, Send, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { InfraData } from '../libs/types'
import { mappingInfraDataToReactFlow } from '../libs/utils'

interface GenerateInfraProps {
  isOpen: boolean
  onClose: () => void
  onApplySuggestion?: (suggestion: any, sessionId: string) => void
}

export function GenerateInfra({ isOpen, onClose, onApplySuggestion }: GenerateInfraProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const { messages, isLoading, sendMessage, generateInfrastructure, sessionId } =
    useInfrastructureChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleApplySpec = (spec: InfraData) => {
    if (onApplySuggestion) {
      onApplySuggestion(mappingInfraDataToReactFlow(spec), sessionId)
      toast.success('Infrastructure applied to diagram successfully!')
      setTimeout(() => {
        onClose()
      }, 500)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    await sendMessage(input)
    setInput('')
  }

  const handleGenerate = async () => {
    await generateInfrastructure()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className={cx('bg-white dark:bg-gray-800 flex flex-col size-full')}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Infrastructure Assistant</h2>
          <button
            onClick={() => router.push(ROUTES.DASHBOARD)}
            className="p-2 rounded-md hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-300 mt-20 space-y-5">
              <p className="text-xl font-semibold">Welcome to Infrastructure Assistant!</p>
              <p className="text-sm leading-relaxed max-w-sm mx-auto text-gray-600 dark:text-gray-400">
                Ask me to help design your cloud infrastructure. Describe your requirements and I'll
                provide suggestions and configurations to get you started.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn('max-w-[80%] space-y-2')}>
                {/* Status indicator (analyzing) */}
                {message.status === 'analyzing' && message.statusMessage && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 animate-pulse">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Search className="w-4 h-4" />
                      <span className="font-medium">{message.statusMessage}</span>
                    </div>
                  </div>
                )}

                {/* Thinking indicator */}
                {message.thinking && message.isStreaming && !message.status && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-300">
                      <Brain className="w-4 h-4 animate-pulse" />
                      <span className="font-medium text-sm">Thinking...</span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 line-clamp-3 whitespace-pre-wrap">
                      {message.thinking}
                    </p>
                  </div>
                )}

                {/* Clarification */}
                {message.clarification && !message.isStreaming && !message.readyToGenerate && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium text-sm">Need More Information</span>
                    </div>
                    <p className="text-sm text-amber-900 dark:text-amber-100 mb-3">
                      {message.clarification.message}
                    </p>
                    {message.clarification.missing_info.length > 0 && (
                      <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/40 rounded text-xs">
                        <p className="font-medium mb-1">Missing:</p>
                        <ul className="space-y-1">
                          {message.clarification.missing_info.map((info, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-amber-600 rounded-full" />
                              {info.replace('_', ' ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Ready to Generate */}
                {message.readyToGenerate && !message.isStreaming && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3 text-green-700 dark:text-green-300">
                      <Rocket className="w-5 h-5" />
                      <span className="font-semibold">Ready to Generate!</span>
                    </div>
                    <p className="text-sm text-green-900 dark:text-green-100 mb-4">
                      {message.content}
                    </p>
                    <Button
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {isLoading ? (
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

                {/* Message content (for user messages and other types) */}
                {message.content &&
                  !message.clarification &&
                  !message.readyToGenerate &&
                  (message.role === 'user' || message.content !== '') && (
                    <div
                      className={cn(
                        'rounded-lg p-3 animate-fade-in',
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      )}
                    >
                      <div className="text-sm">
                        <MessageContent
                          content={message.content}
                          isStreaming={message.isStreaming}
                        />
                      </div>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                {/* Infrastructure Suggestion Card */}
                {message.generatedSpec && (
                  <Card className="mt-4 border-2 border-green-500">
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
                          <p className="font-medium">{message.generatedSpec.project}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Region</p>
                          <p className="font-medium">{message.generatedSpec.region}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Resources</p>
                          <p className="font-medium">{message.generatedSpec.resources.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Connections</p>
                          <p className="font-medium">{message.generatedSpec.connections.length}</p>
                        </div>
                      </div>

                      {/* Resources List */}
                      <div>
                        <p className="text-sm font-semibold mb-2">Resources:</p>
                        <div className="space-y-1">
                          {message.generatedSpec.resources.map((resource) => (
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
                        onClick={() => handleApplySpec(message.generatedSpec!)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply to Diagram
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ))}

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
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? (
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
