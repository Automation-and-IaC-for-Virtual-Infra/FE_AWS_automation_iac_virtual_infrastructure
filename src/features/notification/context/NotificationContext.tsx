'use client'

import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { handleMarkAsRead } from '../libs/actions'
import { fetchNotifications } from '../libs/fetchers'
import { NotificationData } from '../libs/types'

interface NotificationContextType {
  notifications: NotificationData[]
  unreadCount: number
  setUnreadCount: Dispatch<SetStateAction<number>>
  loading: boolean
  markAsRead: (id: number) => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications
  const fetchNotificationsData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchNotifications({
        page: 1,
        per_page: 10,
      })
      if (!response.items) return

      setNotifications(response.items || [])
      setUnreadCount(response.unread_count || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Mark as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      const response = await handleMarkAsRead(id)
      if (!response.success) return

      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotificationsData()
  }, [fetchNotificationsData])

  // Initial fetch
  useEffect(() => {
    fetchNotificationsData()
  }, [fetchNotificationsData])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotificationsData()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchNotificationsData])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        setUnreadCount,
        loading,
        markAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
