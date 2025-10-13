'use client'

import { cn } from '@/lib/utils'
import { MessageCircle, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Position {
  x: number
  y: number
}

interface FloatingChatButtonProps {
  onToggle: () => void
  isOpen: boolean
}

export function FloatingChatButton({ onToggle, isOpen }: FloatingChatButtonProps) {
  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
  })
  const [firstRender, setFirstRender] = useState(true)

  const [isDragging, setIsDragging] = useState(false)
  const [isDraggedRecently, setIsDraggedRecently] = useState(false)
  const dragStartRef = useRef<Position>({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const snapToEdge = useCallback((x: number, y: number) => {
    const margin = 20
    const buttonSize = 60

    // Calculate distances to each edge
    const distToLeft = x
    const distToRight = window.innerWidth - x - buttonSize
    const distToTop = y
    const distToBottom = window.innerHeight - y - buttonSize

    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom)

    let targetX = x
    let targetY = y

    // Snap to closest edge
    if (minDist === distToLeft) {
      targetX = margin // Left edge
    } else if (minDist === distToRight) {
      targetX = window.innerWidth - buttonSize - margin // Right edge
    } else if (minDist === distToTop) {
      targetY = margin // Top edge
    } else {
      targetY = window.innerHeight - buttonSize - margin // Bottom edge
    }

    return { x: targetX, y: targetY }
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      setIsDraggedRecently(false)
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
    },
    [position]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      setIsDraggedRecently(true)

      // Cancel previous animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        let newX = e.clientX - dragStartRef.current.x
        let newY = e.clientY - dragStartRef.current.y

        const margin = 20
        const buttonSize = 60

        newX = Math.max(margin, Math.min(newX, window.innerWidth - buttonSize - margin))
        newY = Math.max(margin, Math.min(newY, window.innerHeight - buttonSize - margin))

        setPosition({ x: newX, y: newY })
      })
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    // Snap to nearest edge
    setPosition((prev) => snapToEdge(prev.x, prev.y))
  }, [snapToEdge])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true })
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleClick = useCallback(() => {
    // Only open modal if not dragged recently
    if (!isDraggedRecently) {
      onToggle()
    }
    // Reset flag after a short delay
    setTimeout(() => setIsDraggedRecently(false), 100)
  }, [isDraggedRecently, onToggle])

  useEffect(() => {
    if (typeof window === 'undefined') return

    setPosition({
      x: window.innerWidth - 80,
      y: window.innerHeight - 80,
    })

    setTimeout(() => setFirstRender(false), 500)
  }, [])

  return (
    <button
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={cn(
        'fixed z-50 w-14 h-14 rounded-full shadow-lg',
        'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl',
        'flex items-center justify-center text-white',
        'touch-none select-none', // Prevent text selection and touch scrolling
        isDragging
          ? 'cursor-grabbing scale-110 transition-transform'
          : 'cursor-grab hover:scale-110 transition-all duration-200',
        firstRender && 'opacity-0'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        willChange: isDragging ? 'transform' : 'auto', // Optimize rendering
      }}
    >
      {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
    </button>
  )
}
