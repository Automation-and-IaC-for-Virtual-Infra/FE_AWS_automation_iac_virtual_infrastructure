import { StreamMessage } from '@/types/chat'

export const extractJsonObjects = (text: string): StreamMessage[] => {
  const results: StreamMessage[] = []

  const parts = text.split('data: ')

  for (const part of parts) {
    if (!part.trim()) continue

    const jsonStart = part.indexOf('{')
    if (jsonStart === -1) continue

    let braceCount = 0
    let jsonEnd = -1

    for (let i = jsonStart; i < part.length; i++) {
      if (part[i] === '{') braceCount++
      if (part[i] === '}') braceCount--

      if (braceCount === 0) {
        jsonEnd = i + 1
        break
      }
    }

    if (jsonEnd === -1) continue

    const jsonStr = part.substring(jsonStart, jsonEnd)
    try {
      const parsed = JSON.parse(jsonStr) as StreamMessage
      results.push(parsed)
    } catch (error) {
      console.warn('Failed to parse JSON:', jsonStr.substring(0, 100))
      console.error('Error details:', error)
    }
  }

  return results
}
