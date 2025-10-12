'use server'

import { ENV } from '@/constants/env'
import { getSecretHash } from '@/utils/string'
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const client = new CognitoIdentityProviderClient({ region: ENV.AWS_REGION })

export async function registerAction(values: {
  email: string
  password: string
  name?: string
}): Promise<{
  success: boolean
  message?: string
  error?: string
  userConfirmed?: boolean
}> {
  try {
    const SECRET_HASH = getSecretHash(values.email)

    const command = new SignUpCommand({
      ClientId: ENV.COGNITO_CLIENT_ID,
      Username: values.email,
      Password: values.password,
      SecretHash: SECRET_HASH,
      UserAttributes: [
        {
          Name: 'email',
          Value: values.email,
        },
        ...(values.name
          ? [
              {
                Name: 'name',
                Value: values.name,
              },
            ]
          : []),
      ],
    })

    const response = await client.send(command)

    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      userConfirmed: response.UserConfirmed,
    }
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.name === 'UsernameExistsException') {
      return {
        success: false,
        error: 'An account with this email already exists.',
      }
    }

    if (error.name === 'InvalidPasswordException') {
      return {
        success: false,
        error:
          'Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, numbers, and special characters.',
      }
    }

    if (error.name === 'InvalidParameterException') {
      return {
        success: false,
        error: 'Invalid email or password format.',
      }
    }

    return {
      success: false,
      error: error.message || 'Registration failed. Please try again.',
    }
  }
}

export async function confirmRegistrationAction(
  email: string,
  code: string
): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const SECRET_HASH = getSecretHash(email)

    const command = new ConfirmSignUpCommand({
      ClientId: ENV.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      SecretHash: SECRET_HASH,
    })

    await client.send(command)

    return {
      success: true,
      message: 'Email verified successfully! You can now login.',
    }
  } catch (error: any) {
    console.error('Confirmation error:', error)

    if (error.name === 'CodeMismatchException') {
      return {
        success: false,
        error: 'Invalid verification code. Please try again.',
      }
    }

    if (error.name === 'ExpiredCodeException') {
      return {
        success: false,
        error: 'Verification code has expired. Please request a new one.',
      }
    }

    return {
      success: false,
      error: error.message || 'Email verification failed.',
    }
  }
}

export async function resendConfirmationCodeAction(email: string): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    const SECRET_HASH = getSecretHash(email)

    const command = new ResendConfirmationCodeCommand({
      ClientId: ENV.COGNITO_CLIENT_ID,
      Username: email,
      SecretHash: SECRET_HASH,
    })

    await client.send(command)

    return {
      success: true,
      message: 'Verification code has been resent to your email.',
    }
  } catch (error: any) {
    console.error('Resend code error:', error)

    return {
      success: false,
      error: error.message || 'Failed to resend verification code.',
    }
  }
}
