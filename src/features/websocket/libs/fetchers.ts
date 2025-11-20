'use server'

import { ENV } from '@/constants/env'

export const getURLBE = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return ENV.WS_BACKEND_SERVER_URL
}
