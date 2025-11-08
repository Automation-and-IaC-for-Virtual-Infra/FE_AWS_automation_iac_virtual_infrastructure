'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ROUTES } from '@/constants/route'
import { cx } from 'class-variance-authority'
import { CheckCircle, Loader2, ShieldCheck, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { checkAlreadyVerified, updateAwsConnection, verifyAwsCredentials } from './lib/actions'

export function AwsVerification() {
  const router = useRouter()

  const [values, setValues] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    sshPublicKey: '',
    sshPrivateKey: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [alreadyVerified, setAlreadyVerified] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      values.accessKeyId &&
      values.secretAccessKey &&
      values.region &&
      values.sshPublicKey &&
      values.sshPrivateKey
    )
  }, [values])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setResult(null)

    const resVerify = await verifyAwsCredentials(values)
    let resultData = resVerify
    if (resVerify.success) {
      const resStoreConnections = await updateAwsConnection([
        { name: 'access-key', value: values.accessKeyId },
        { name: 'private-key', value: values.secretAccessKey },
        { name: 'region', value: values.region },
        { name: 'ssh-public-key', value: values.sshPublicKey },
        { name: 'ssh-private-key', value: values.sshPrivateKey },
      ])
      if (resStoreConnections.success) {
        setShowSuccess(true)
      } else {
        resultData = resStoreConnections
      }
    }

    setResult(resultData)
    setLoading(false)
  }

  const handleGoHome = () => {
    router.push(ROUTES.DASHBOARD)
  }

  const verify = async () => {
    setLoading(true)
    const res = await checkAlreadyVerified()
    setAlreadyVerified(res)
    setLoading(false)
  }

  useEffect(() => {
    verify()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {showSuccess || alreadyVerified ? (
        <Card className="w-full max-w-[500px] mx-auto shadow-2xl border-green-200">
          <CardContent className="pt-12 pb-8">
            <div className="flex flex-col items-center gap-6 text-center">
              {/* Success Icon */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-green-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">AWS Credentials Verified!</h2>
                {!alreadyVerified && (
                  <p className="text-gray-600">
                    Your credentials have been successfully verified and saved.
                  </p>
                )}
              </div>

              {/* Verified Info */}
              {!alreadyVerified && (
                <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-medium text-gray-900">
                      {values.region || 'ap-southeast-1'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Access Key:</span>
                    <span className="font-mono text-xs text-gray-900">
                      {values.accessKeyId
                        ? `${values.accessKeyId.slice(0, 8)}...${values.accessKeyId.slice(-4)}`
                        : '****'}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <Button
                  onClick={handleGoHome}
                  className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                  size="lg"
                >
                  Go Home
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button onClick={() => setShowSuccess(false)} variant="outline" className="w-full">
                  Update Credentials
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-[640px] mx-auto mt-10 shadow-lg">
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
              <Textarea
                placeholder="SSH Public Key"
                name="sshPublicKey"
                value={values.sshPublicKey}
                onChange={handleChange}
                rows={4}
                className="h-50"
              />
              <Textarea
                placeholder="SSH Private Key"
                name="sshPrivateKey"
                value={values.sshPrivateKey}
                onChange={handleChange}
                rows={4}
                className="h-50"
              />

              <Button type="submit" disabled={loading || !canSubmit} className="mt-2">
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
                  <CheckCircle className="h-5 w-5 mb-1" />
                ) : (
                  <XCircle className="h-5 w-5 mb-1" />
                )}
                <AlertDescription
                  className={cx(result.success ? 'text-green-800' : 'text-red-800')}
                >
                  {result.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
