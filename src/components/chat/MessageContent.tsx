'use client'

interface MessageContentProps {
  content: string
  isStreaming?: boolean
}

export function MessageContent({ content, isStreaming }: MessageContentProps) {
  try {
    const parsed = JSON.parse(content)
    if (parsed.clarification_question) {
      return (
        <div className="space-y-2">
          <p className="font-medium">I need more information:</p>
          <p>{parsed.clarification_question}</p>

          {parsed.missing_info && parsed.missing_info.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-xs font-medium mb-1">Missing information:</p>
              <ul className="text-xs space-y-1">
                {parsed.missing_info.map((info: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-500 rounded-full" />
                    {info.replace('_', ' ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }

    // Handle complete response
    if (parsed.is_complete && parsed.suggestion) {
      return (
        <div className="space-y-2">
          <p className="font-medium">Infrastructure designed successfully!</p>
          <p className="text-sm opacity-90">
            I've created a suggested infrastructure with {parsed.suggestion.services?.length || 0}{' '}
            services.
          </p>
        </div>
      )
    }

    // Generic JSON display
    return <pre className="text-xs overflow-x-auto">{JSON.stringify(parsed, null, 2)}</pre>
  } catch {
    // Not JSON, display as plain text
    return (
      <>
        {content}
        {isStreaming && <span className="animate-pulse ml-1">▋</span>}
      </>
    )
  }
}
