'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/route'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { ca } from 'zod/v4/locales'
import { LoginSchema, LoginSchemaType, MfaSchema, MfaSchemaType } from './lib/schema'
import { loginAction, verifyMfaAction } from './lib/actions'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()

  const [mfaRequired, setMfaRequired] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')

  const loginForm = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const mfaForm = useForm<MfaSchemaType>({
    resolver: zodResolver(MfaSchema),
    defaultValues: {
      mfaCode: '',
    },
  })

  useEffect(() => {
    const token = localStorage.getItem('idToken')
    if (token) window.location.href = ROUTES.DASHBOARD
  }, [])

  const saveSession = (session: any) => {
    localStorage.setItem('idToken', session.getIdToken().getJwtToken())
    localStorage.setItem('accessToken', session.getAccessToken().getJwtToken())
    localStorage.setItem('refreshToken', session.getRefreshToken().getToken())
  }

  const onLoginSubmit = async (values: LoginSchemaType) => {
    setIsLoading(true)

    try {
      const result = await loginAction(values)
      if (result.success) {
        if (result.mfaRequired) {
          setUsername(result.username)
          setMfaRequired(true)
          toast.info('Please enter your MFA code')
        } else {
          toast.success('Login successful!')
          router.push(ROUTES.DASHBOARD)
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const onMfaSubmit = async (values: MfaSchemaType) => {
    setIsLoading(true)

    try {
      const result = await verifyMfaAction(username, values)

      if (result.success) {
        toast.success('MFA verified successfully!')
        router.push(ROUTES.DASHBOARD)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {mfaRequired ? 'MFA Verification' : 'Login'}
          </CardTitle>
          <CardDescription>
            {mfaRequired
              ? 'Enter the MFA code from your authenticator app'
              : 'Enter your email and password to login'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!mfaRequired ? (
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Login'}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link href="/register" className="text-blue-600 hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...mfaForm}>
              <form onSubmit={mfaForm.handleSubmit(onMfaSubmit)} className="space-y-4" noValidate>
                <FormField
                  control={mfaForm.control}
                  name="mfaCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MFA Code</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          disabled={isLoading}
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Verify'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
