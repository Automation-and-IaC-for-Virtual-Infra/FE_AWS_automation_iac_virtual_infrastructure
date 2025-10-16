'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cx } from 'class-variance-authority'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { verifyAwsCredentials } from './lib/actions'

export function AwsVerification() {
  const [values, setValues] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    monitoringEndpoint: '',
    ipPool: '',
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await verifyAwsCredentials(values)
      setResult(res)
    } catch (err: any) {
      setResult({ success: false, message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto mt-10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Verify AWS Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              placeholder="AWS Access Key ID"
              name="accessKeyId"
              value={values.accessKeyId}
              onChange={handleChange}
              required
            />
            <Input
              placeholder="AWS Secret Access Key"
              name="secretAccessKey"
              type="password"
              value={values.secretAccessKey}
              onChange={handleChange}
              required
            />
            <Input
              placeholder="AWS Region (e.g. ap-southeast-1)"
              name="region"
              value={values.region}
              onChange={handleChange}
              required
            />
            <Input
              placeholder="Monitoring Endpoint (optional)"
              name="monitoringEndpoint"
              value={values.monitoringEndpoint}
              onChange={handleChange}
            />
            <Input
              placeholder="IP Pool (optional)"
              name="ipPool"
              value={values.ipPool}
              onChange={handleChange}
            />

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify'}
            </Button>
          </form>

          {result && (
            <Alert
              variant={result.success ? 'default' : 'destructive'}
              className={cx(
                'mt-4 flex items-center gap-2',
                result.success
                  ? 'border-green-600 bg-green-50 text-green-800'
                  : 'border-red-600 bg-red-50 text-red-800'
              )}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
