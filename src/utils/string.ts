import { ENV } from '@/constants/env'
import crypto from 'crypto'

export const getSecretHash = (username: string) => {
  return crypto
    .createHmac('SHA256', ENV.COGNITO_CLIENT_SECRET)
    .update(username + ENV.COGNITO_CLIENT_ID)
    .digest('base64')
}
