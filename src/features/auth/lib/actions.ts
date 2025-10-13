'use server'

import { ENV } from '@/constants/env'
import { COOKIE_OPTIONS, deleteCookie, setCookie } from '@/utils/cookie'
import { getSecretHash } from '@/utils/string'
import {
  AuthenticationResultType,
  ChallengeNameType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import jwt, { JwtPayload } from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'
import type { LoginSchemaType } from './schema'

const client = new CognitoIdentityProviderClient({ region: ENV.AWS_REGION })

export async function newPasswordRequiredAction(
  username: string,
  newPassword: string,
  session: string
): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const SECRET_HASH = getSecretHash(username)
    const command = new RespondToAuthChallengeCommand({
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: ENV.COGNITO_CLIENT_ID,
      Session: session,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
        SECRET_HASH,
      },
    })

    const res = await client.send(command)
    const tokens = res.AuthenticationResult
    if (!tokens) {
      return {
        success: false,
        error: 'No tokens received',
      }
    }

    // Save tokens to cookies
    const { IdToken = '', AccessToken = '', RefreshToken = '' }: AuthenticationResultType = tokens
    await setCookie('idToken', IdToken, COOKIE_OPTIONS)
    await setCookie('accessToken', AccessToken, COOKIE_OPTIONS)
    await setCookie('refreshToken', RefreshToken, COOKIE_OPTIONS)

    return {
      success: true,
      message: 'Password changed successfully',
    }
  } catch (error: any) {
    if (error.name === 'InvalidPasswordException') {
      return {
        success: false,
        error:
          'Password does not meet the required criteria. Please ensure it has at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
      }
    }

    if (error.name === 'NotAuthorizedException') {
      return {
        success: false,
        error: 'The session has expired. Please log in again to set a new password.',
      }
    }
    return error.message || 'Setting new password failed'
  }
}

export async function loginAction(values: LoginSchemaType): Promise<{
  success: boolean
  message?: string
  challenge?: ChallengeNameType
  needConfirmation?: boolean
  email?: string
  session?: string
  error?: string
}> {
  try {
    const SECRET_HASH = getSecretHash(values.email)
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: ENV.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: values.email,
        PASSWORD: values.password,
        SECRET_HASH,
      },
    })

    const res = await client.send(command)
    const session = res.Session || ''

    if (res.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      return {
        success: true,
        message: 'New password required',
        challenge: 'NEW_PASSWORD_REQUIRED',
        session: session,
      }
    }

    const tokens = res.AuthenticationResult
    if (!tokens) {
      return {
        success: false,
        error: 'No tokens received',
      }
    }

    // Save tokens to cookies
    const { IdToken = '', AccessToken = '', RefreshToken = '' } = tokens
    await setCookie('idToken', IdToken, COOKIE_OPTIONS)
    await setCookie('accessToken', AccessToken, COOKIE_OPTIONS)
    await setCookie('refreshToken', RefreshToken, COOKIE_OPTIONS)
    return {
      success: true,
      message: 'Login successful',
    }
  } catch (error: any) {
    console.log('🚀 ~ loginAction ~ error:', error)

    // User not confirmed
    if (error.name === 'UserNotConfirmedException') {
      return {
        success: false,
        needConfirmation: true,
        email: values.email,
        error: 'Please verify your email address to continue.',
      }
    }

    if (error.name === 'NotAuthorizedException') {
      return {
        success: false,
        error: 'Incorrect email or password.',
      }
    }

    if (error.name === 'UserNotFoundException') {
      return {
        success: false,
        error: 'User does not exist.',
      }
    }

    return {
      success: false,
      error: error.message || 'Login failed',
    }
  }
}

export async function verifyTokenAction(token: string): Promise<{
  success: boolean
  session?: { idToken: string; accessToken: string }
  error?: string
}> {
  try {
    const JWKS_URL = `https://cognito-idp.${ENV.AWS_REGION}.amazonaws.com/${ENV.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
    const res = await fetch(JWKS_URL)
    if (!res.ok) {
      return {
        success: false,
        error: 'Failed to fetch JWKS',
      }
    }

    const { keys } = await res.json()
    const pems: { [key: string]: string } = {}
    keys.forEach((key: any) => {
      const pem = jwkToPem(key)
      pems[key.kid] = pem
    })

    const decodedJwt = jwt.decode(token, { complete: true }) as JwtPayload
    if (!decodedJwt || !decodedJwt.header.kid) {
      return {
        success: false,
        error: 'Invalid token',
      }
    }

    const kid = decodedJwt.header.kid
    const pem = pems[kid]
    if (!pem) {
      return {
        success: false,
        error: 'Invalid token',
      }
    }
    const verified = jwt.verify(token, pem, { algorithms: ['RS256'] }) as JwtPayload
    if (!verified) {
      return {
        success: false,
        error: 'Invalid token',
      }
    }

    if (verified.exp && Date.now() >= verified.exp * 1000) {
      return {
        success: false,
        error: 'Token has expired',
      }
    }
    return { success: true, session: { idToken: token, accessToken: '' } }
  } catch (error) {
    console.log('🚀 ~ verifyTokenAction ~ error:', error)
    return {
      success: false,
      error: 'Failed to fetch JWKS',
    }
  }
}

export async function logoutAction() {
  await deleteCookie('idToken')
  await deleteCookie('accessToken')
  await deleteCookie('refreshToken')

  return { success: true }
}
