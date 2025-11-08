import { LOCALSTORAGE_KEYS } from '@/constants/common'

export const isExpiredDeployment = (): boolean => {
  const createdAt = localStorage.getItem(LOCALSTORAGE_KEYS.CREATED_AT_DEPLOYMENT)
  if (!createdAt) return false

  const createdAtDate = new Date(createdAt)
  const now = new Date()
  const diff = now.getTime() - createdAtDate.getTime()

  const isExpired = diff > 1000 * 60 * 60 // 1 hour in milliseconds
  if (isExpired) {
    localStorage.removeItem(LOCALSTORAGE_KEYS.IS_DEPLOYING)
    localStorage.removeItem(LOCALSTORAGE_KEYS.CREATED_AT_DEPLOYMENT)
  }

  return isExpired
}
