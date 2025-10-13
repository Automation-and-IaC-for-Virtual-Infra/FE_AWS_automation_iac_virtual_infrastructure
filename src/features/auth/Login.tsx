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
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { loginAction } from './lib/actions'
import { LoginSchema, LoginSchemaType } from './lib/schema'

export default function Login() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const loginForm = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
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
    const result = await loginAction(values)

    // New password required
    if (result?.challenge === 'NEW_PASSWORD_REQUIRED' && result?.session) {
      router.push(
        `${ROUTES.NEW_PASSWORD_REQUIRED}?username=${values.email}&session=${result.session}`
      )
      return
    }

    // Need to confirm registration
    if (result.needConfirmation && result.email) {
      toast.error(result.error)
      router.push(`${ROUTES.CONFIRM_REGISTRATION}?email=${result.email}&from=login`)
      return
    }

    if (result.success) {
      toast.success('Login successful!')
      router.push(ROUTES.DASHBOARD)
    } else {
      toast.error(result.error || 'Login failed')
    }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your email and password to login</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4" noValidate>
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
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        disabled={isLoading}
                        endIcon={
                          <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
                            {showPassword ? (
                              <EyeOff className="size-5" />
                            ) : (
                              <Eye className="size-5" />
                            )}
                          </button>
                        }
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
        </CardContent>
      </Card>
    </div>
  )
}
