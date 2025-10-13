'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { REGEX } from '@/constants/regex'
import { ROUTES } from '@/constants/route'
import { cx } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { newPasswordRequiredAction } from './lib/actions'

export default function NewPasswordRequirePage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const validPassword = useMemo(() => {
    if (!newPassword) return false

    return REGEX.PASSWORD.test(newPassword)
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const params = new URLSearchParams(window.location.search)
    const username = params.get('username') || ''
    const session = params.get('session') || ''

    const res = await newPasswordRequiredAction(username, newPassword, session)
    if (res.success) {
      toast.success(res.message || 'Password changed successfully! Redirecting...')
      setTimeout(() => router.push(ROUTES.DASHBOARD), 2000)
    } else {
      toast.error(res.error || 'An error occurred')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl text-center font-semibold">Set New Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <p className="text-xs text-muted-foreground">
                <span className={cx(newPassword.length >= 8 && 'text-green-600')}>
                  <span className="text-red-500">*</span> Password must be at least 8 characters
                  long.
                </span>
                <br />
                <span className={cx(validPassword && 'text-green-600')}>
                  <span className="text-red-500">*</span> Include uppercase, lowercase, number, and
                  special character.
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Confirm Password</Label>
              <Input
                id="username"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className={cx(
                  confirmPassword &&
                    (newPassword !== confirmPassword
                      ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                      : 'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20')
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || newPassword !== confirmPassword || !validPassword}
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Confirm'}
              {loading ? 'Processing...' : ''}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
