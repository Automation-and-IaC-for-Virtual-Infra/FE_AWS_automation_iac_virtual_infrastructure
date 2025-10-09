'use server'

import { AuthenticationDetails, CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js'
import { cookies } from 'next/headers'
import { userPool } from './configs'
import type { LoginSchemaType, MfaSchemaType } from './schema'

type LoginResult =
  | { success: true; mfaRequired: false; session: any }
  | { success: true; mfaRequired: true; username: string }
  | { success: false; error: string }

export async function loginAction(values: LoginSchemaType): Promise<LoginResult> {
  return new Promise((resolve) => {
    const authDetails = new AuthenticationDetails({
      Username: values.email,
      Password: values.password,
    })

    const user = new CognitoUser({
      Username: values.email,
      Pool: userPool,
    })

    user.authenticateUser(authDetails, {
      onSuccess: async (session: CognitoUserSession) => {
        // Save tokens to cookies (httpOnly for security)
        const cookieStore = await cookies()
        cookieStore.set('idToken', session.getIdToken().getJwtToken(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        cookieStore.set('accessToken', session.getAccessToken().getJwtToken(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
        })

        cookieStore.set('refreshToken', session.getRefreshToken().getToken(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })

        resolve({
          success: true,
          mfaRequired: false,
          session: {
            idToken: session.getIdToken().getJwtToken(),
            accessToken: session.getAccessToken().getJwtToken(),
          },
        })
      },
      onFailure: (err: any) => {
        resolve({
          success: false,
          error: err.message || 'Login failed',
        })
      },
      mfaRequired: () => {
        resolve({
          success: true,
          mfaRequired: true,
          username: values.email,
        })
      },
    })
  })
}

type MfaResult = { success: true; session: any } | { success: false; error: string }

export async function verifyMfaAction(username: string, values: MfaSchemaType): Promise<MfaResult> {
  return new Promise((resolve) => {
    const user = new CognitoUser({
      Username: username,
      Pool: userPool,
    })

    user.sendMFACode(
      values.mfaCode,
      {
        onSuccess: async (session: CognitoUserSession) => {
          // Save tokens
          const cookieStore = await cookies()
          cookieStore.set('idToken', session.getIdToken().getJwtToken(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          })

          cookieStore.set('accessToken', session.getAccessToken().getJwtToken(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          })

          cookieStore.set('refreshToken', session.getRefreshToken().getToken(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
          })

          resolve({
            success: true,
            session: {
              idToken: session.getIdToken().getJwtToken(),
              accessToken: session.getAccessToken().getJwtToken(),
            },
          })
        },
        onFailure: (err: any) => {
          resolve({
            success: false,
            error: err.message || 'MFA verification failed',
          })
        },
      },
      'SOFTWARE_TOKEN_MFA'
    )
  })
}

export async function logoutAction() {
  const cookieStore = await cookies()

  cookieStore.delete('idToken')
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}
