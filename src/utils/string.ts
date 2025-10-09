import crypto from 'crypto'

export const calculateSecretHash = (username: string) => {
  const clientSecret = process.env.COGNITO_CLIENT_SECRET || ''
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''

  return crypto
    .createHmac('SHA256', clientSecret)
    .update(username + clientId)
    .digest('base64')
}
