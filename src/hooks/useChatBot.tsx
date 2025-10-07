import { useState } from 'react'

export function useChatBot() {
  const [isOpen, setIsOpen] = useState(false)

  const handleSendMessage = async (message: string) => {
    try {
      const response = await fetch('/api/chat/infrastructure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) throw new Error('Failed to get AI response')

      const data = await response.json()
      return {
        message: data.message, // Text response từ AI
        suggestion: data.suggestion, // Infrastructure suggestions
      }
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  return {
    isOpen,
    setIsOpen,
    handleSendMessage,
  }
}
