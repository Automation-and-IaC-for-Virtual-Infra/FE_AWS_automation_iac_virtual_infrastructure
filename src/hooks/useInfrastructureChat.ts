'use client'

import { InfraData } from '@/features/infrastructure/setup/libs/types'
import { extractJsonObjects } from '@/utils/streaming'
import { useCallback, useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  thinking?: string
  status?: string
  statusMessage?: string
  clarification?: {
    message: string
    missing_info: string[]
  }
  readyToGenerate?: boolean
  generatedSpec?: InfraData | null
  suggestion?: any
}

export function useInfrastructureChat() {
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isLoading) return

      const userMessage: Message = {
        id: `${Date.now()}-user`,
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      const aiMessageId = `${Date.now()}-ai`
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }
      setMessages((prev) => [...prev, aiMessage])

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, session_id: sessionId }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) throw new Error('No reader available')

        let fullText = ''
        let accumulatedContent = ''
        let accumulatedThinking = ''
        let currentStatus = ''
        let currentStatusMessage = ''
        let parsedSuggestion: any = null
        let clarificationData: any = null
        let isReadyToGenerate = false
        let readyMessage = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log('🏁 Stream ended')
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          fullText += chunk
          const jsonObjects = extractJsonObjects(fullText)

          for (const parsed of jsonObjects) {
            switch (parsed.type) {
              case 'session_created':
                if (parsed.session_id) {
                  setSessionId(parsed.session_id)
                }
                break

              case 'status':
                if (parsed.status && parsed.message) {
                  currentStatus = parsed.status
                  currentStatusMessage = parsed.message

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? {
                            ...msg,
                            status: currentStatus,
                            statusMessage: currentStatusMessage,
                          }
                        : msg
                    )
                  )
                }
                break

              case 'thinking':
                if (parsed.token) {
                  accumulatedThinking = parsed.accumulated_thought || parsed.token

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? {
                            ...msg,
                            thinking: accumulatedThinking,
                            status: undefined,
                          }
                        : msg
                    )
                  )
                }
                break

              case 'content':
                if (parsed.accumulated) {
                  accumulatedContent = parsed.accumulated
                  parsedSuggestion = JSON.parse(accumulatedContent)
                  if (parsedSuggestion.is_complete === true) {
                    console.log('✅ Content is complete, waiting for ready_to_generate...')
                  }

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? {
                            ...msg,
                            content: accumulatedContent,
                            suggestion: parsedSuggestion,
                            thinking: undefined,
                          }
                        : msg
                    )
                  )
                }
                break

              case 'clarification':
                if (parsed.message) {
                  clarificationData = {
                    message: parsed.message,
                    missing_info: parsed.missing_info || [],
                  }

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? {
                            ...msg,
                            clarification: clarificationData,
                            content: parsed?.message || '',
                            thinking: undefined,
                            status: undefined,
                          }
                        : msg
                    )
                  )
                }
                break

              case 'ready_to_generate':
                if (parsed.message) {
                  isReadyToGenerate = true
                  readyMessage = parsed.message

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? {
                            ...msg,
                            content: readyMessage,
                            readyToGenerate: true,
                            thinking: undefined,
                            status: undefined,
                            clarification: undefined,
                          }
                        : msg
                    )
                  )
                }
                break

              case 'complete':
                console.log('✅ Stream complete')
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          isStreaming: false,
                          thinking: undefined,
                          status: undefined,
                        }
                      : msg
                  )
                )
                break

              case 'error':
                console.error('❌ Stream error:', parsed.error)
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          content: `Error: ${parsed.error}`,
                          isStreaming: false,
                          thinking: undefined,
                          status: undefined,
                        }
                      : msg
                  )
                )
                break
            }
          }
        }

        // Final update
        const finalContent =
          readyMessage || clarificationData?.message || accumulatedContent || 'No response received'

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: finalContent,
                  readyToGenerate: isReadyToGenerate,
                  isStreaming: false,
                  thinking: undefined,
                  status: undefined,
                }
              : msg
          )
        )
      } catch (error) {
        console.error('❌ Chat error:', error)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: `Sorry, there was an error: ${
                    error instanceof Error ? error.message : 'Unknown error'
                  }`,
                  isStreaming: false,
                  thinking: undefined,
                  status: undefined,
                }
              : msg
          )
        )
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId, isLoading]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setSessionId('')
  }, [])

  // ✅ Updated method to handle infrastructure generation streaming
  const generateInfrastructure = useCallback(async () => {
    if (!sessionId) {
      console.warn('No session ID available')
      return
    }

    setIsLoading(true)

    const aiMessageId = `${Date.now()}-generation`
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages((prev) => [...prev, aiMessage])

    try {
      const response = await fetch('/api/generate_spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      let fullText = ''
      let accumulatedContent = ''
      let accumulatedThinking = ''
      let currentStatus = ''
      let currentStatusMessage = ''
      let finalSpec: InfraData | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('🏁 Generation stream ended')
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        const jsonObjects = extractJsonObjects(fullText)

        for (const parsed of jsonObjects) {
          switch (parsed.type) {
            case 'status':
              // ✅ Handle generating status
              if (parsed.status === 'generating' && parsed.message) {
                currentStatus = parsed.status
                currentStatusMessage = parsed.message

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          status: currentStatus,
                          statusMessage: currentStatusMessage,
                        }
                      : msg
                  )
                )
              }
              break

            case 'thinking':
              // ✅ Show thinking during generation
              if (parsed.token) {
                accumulatedThinking = parsed.accumulated_thought || parsed.token

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          thinking: accumulatedThinking,
                          status: undefined,
                        }
                      : msg
                  )
                )
              }
              break

            case 'content':
              // ✅ Stream JSON spec content
              if (parsed.accumulated) {
                accumulatedContent = parsed.accumulated

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          content: accumulatedContent,
                          thinking: undefined,
                          status: undefined,
                        }
                      : msg
                  )
                )
              }
              break

            case 'completed':
              // ✅ Handle completion with final spec
              if (parsed.spec) {
                finalSpec = parsed.spec as InfraData
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? {
                          ...msg,
                          content: parsed?.message || 'Infrastructure specification generated!',
                          generatedSpec: finalSpec,
                          isStreaming: false,
                          thinking: undefined,
                          status: undefined,
                        }
                      : msg
                  )
                )
              }
              break

            case 'error':
              console.error('❌ Generation error:', parsed.error)
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        content: `Error: ${parsed.error}`,
                        isStreaming: false,
                        thinking: undefined,
                        status: undefined,
                      }
                    : msg
                )
              )
              break
          }
        }
      }

      // Final update if not already completed
      if (!finalSpec && accumulatedContent) {
        try {
          finalSpec = JSON.parse(accumulatedContent) as InfraData
        } catch (e) {
          console.warn('Could not parse final spec from content', e)
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: accumulatedContent || 'Infrastructure specification generated!',
                generatedSpec: finalSpec || undefined,
                isStreaming: false,
                thinking: undefined,
                status: undefined,
              }
            : msg
        )
      )
    } catch (error) {
      console.error('❌ Generation error:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: `Error generating infrastructure: ${
                  error instanceof Error ? error.message : 'Unknown error'
                }`,
                isStreaming: false,
                thinking: undefined,
                status: undefined,
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  return {
    messages,
    isLoading,
    sessionId,
    sendMessage,
    clearMessages,
    generateInfrastructure,
  }
}
