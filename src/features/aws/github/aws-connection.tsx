'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

// 🚨 Import AWS SDK trực tiếp trên FE
import {
  CodeStarConnectionsClient,
  CreateConnectionCommand,
  GetConnectionCommand,
} from '@aws-sdk/client-codestar-connections'

export default function AwsConnectionPage() {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    accessKey: '',
    secretKey: '',
    region: 'ap-southeast-1',
  })

  const createConnection = async () => {
    try {
      setLoading(true)

      // ✅ FE dùng AWS SDK trực tiếp
      const client = new CodeStarConnectionsClient({
        region: form.region,
        credentials: {
          accessKeyId: form.accessKey,
          secretAccessKey: form.secretKey,
        },
      })

      // ⚠️ Tạo GitHub connection trên AWS (FE trực tiếp)
      const command = new CreateConnectionCommand({
        ProviderType: 'GitHub',
        ConnectionName: 'FrontendOnlyConnection',
      })

      const response = await client.send(command)
      console.log('👉 Connection ARN:', response.ConnectionArn)
      if (!response.ConnectionArn) {
        toast.error('❌ Không tạo được ConnectionArn')
        setLoading(false)
        return
      }

      toast.success('✅ Tạo GitHub Connection thành công!')

      // ✅ Lấy URL authorize (để nhảy qua GitHub App)
      const getCommand = new GetConnectionCommand({
        ConnectionArn: response.ConnectionArn,
      })

      const connectionInfo = await client.send(getCommand)

      setLoading(false)

      // Mở trang authorize của AWS → GitHub
      if (connectionInfo.Connection?.OwnerAccountId) {
        const authorizeUrl = `https://${form.region}.console.aws.amazon.com/codesuite/settings/connections?connectionArn=${response.ConnectionArn}`

        window.open(authorizeUrl, '_blank')
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err?.message || 'Có lỗi xảy ra khi tạo connection')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Tạo GitHub Connection trực tiếp từ FE (KHÔNG QUA BE)</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="AWS Access Key"
            value={form.accessKey}
            onChange={(e) => setForm({ ...form, accessKey: e.target.value })}
          />

          <Input
            placeholder="AWS Secret Key"
            type="password"
            value={form.secretKey}
            onChange={(e) => setForm({ ...form, secretKey: e.target.value })}
          />

          <Input
            placeholder="Region (vd: ap-southeast-1)"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />

          <Button className="w-full" onClick={createConnection} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Create GitHub Connection'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
