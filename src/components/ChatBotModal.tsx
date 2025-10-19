'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/route'
import { cn } from '@/lib/utils'
import { cx } from 'class-variance-authority'
import { CheckCircle, FileJson, Loader2, Send, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  suggestion?: any // Infrastructure suggestion data
}

interface ChatBotModalProps {
  isOpen: boolean
  onClose: () => void
  onSendMessage: (message: string) => Promise<any>
  onApplySuggestion?: (suggestion: any) => void
  fullWidth?: boolean
}

export function ChatBotModal({
  isOpen,
  onClose,
  onSendMessage,
  onApplySuggestion,
  fullWidth = false,
}: ChatBotModalProps) {
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [isProjectSubmitted, setIsProjectSubmitted] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleProjectSubmit = () => {
    if (!projectName.trim()) return
    setIsProjectSubmitted(true)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const streamText = async (text: string, messageId: string) => {
    let currentIndex = 0
    const totalLength = text.length
    const duration = 2000
    const startTime = Date.now()

    return new Promise<void>((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const targetIndex = Math.floor(progress * totalLength)

        if (targetIndex > currentIndex) {
          currentIndex = targetIndex
          const currentText = text.slice(0, currentIndex)

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: currentText, isStreaming: progress < 1 }
                : msg
            )
          )
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  const handleApplySuggestion = (messageId: string, suggestion: any) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion)
      setAppliedSuggestions((prev) => new Set(prev).add(messageId))

      setTimeout(() => {
        onClose()
      }, 500)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await onSendMessage(input)

      const aiMessageId = `${Date.now()}-ai`
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        suggestion: response?.suggestion,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)

      if (response?.message) {
        await streamText(response.message, aiMessageId)
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Error sending message:', error)

      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div
        className={cx(
          'bg-white flex flex-col',
          fullWidth ? 'size-full' : 'w-[600px] h-[700px] rounded-lg shadow-2xl'
        )}
      >
        {/* Header */}
        <div
          className={cx(
            'flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-sm',
            !fullWidth && 'rounded-t-lg'
          )}
        >
          {/* Left: Title */}
          <h2 className="text-lg font-semibold tracking-tight">Infrastructure Assistant</h2>

          {/* Center: Project Info */}
          {isProjectSubmitted && (
            <div className="flex flex-col items-center text-xs text-white/90 max-w-[250px]">
              <span className="text-sm font-semibold truncate">{projectName}</span>
              {projectDescription && (
                <span className="text-white/70 text-[11px] italic line-clamp-1">
                  {projectDescription}
                </span>
              )}
            </div>
          )}

          {/* Right: Close Button */}
          <button
            onClick={() => {
              if (isProjectSubmitted) {
                onClose()
                return
              }
              router.push(ROUTES.INFRASTRUCTURE)
            }}
            className="p-2 rounded-md hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isProjectSubmitted && (
            <div className="text-center text-gray-500 mt-10 space-y-5">
              <p className="text-xl font-semibold">Welcome to Infrastructure Assistant!</p>
              <p className="text-sm leading-relaxed max-w-sm mx-auto text-gray-600">
                Please provide your <strong>Project Name</strong> and a short
                <strong> description</strong> of what you want to build.
                <br />
                You can mention specific AWS services or your expected architecture so I can
                generate a more accurate setup.
              </p>

              <div className="max-w-sm mx-auto mt-6 space-y-3">
                {/* Project Name */}
                <div className="space-y-1 text-left">
                  <label className="text-sm font-medium text-gray-700">Project Name</label>
                  <Input
                    placeholder="e.g. MyEcommercePlatform"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleProjectSubmit()}
                    className="w-full"
                  />
                </div>

                {/* Project Description */}
                <div className="space-y-1 text-left">
                  <label className="text-sm font-medium text-gray-700">
                    Project Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe your project goals, main features, and AWS services you'd like to use..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.shiftKey && handleProjectSubmit()}
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleProjectSubmit}
                  disabled={isLoading || !projectName.trim() || !projectDescription.trim()}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Project Info'}
                </Button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn('max-w-[80%] space-y-2')}>
                <div
                  className={cn(
                    'rounded-lg p-3',
                    message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && <span className="animate-pulse">▋</span>}
                  </p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {/* Infrastructure Suggestion Card */}
                {message.suggestion && !message.isStreaming && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FileJson className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        Infrastructure Suggestion
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      <p>
                        <strong>Services:</strong> {message.suggestion.services?.length || 0}
                      </p>
                      <p>
                        <strong>Connections:</strong> {message.suggestion.connections?.length || 0}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleApplySuggestion(message.id, message.suggestion)}
                      disabled={appliedSuggestions.has(message.id)}
                      className="w-full"
                    >
                      {appliedSuggestions.has(message.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        <>
                          <FileJson className="w-4 h-4 mr-2" />
                          Apply to Infrastructure
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {isProjectSubmitted && (
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
        )}
      </div>
    </div>
  )
}
