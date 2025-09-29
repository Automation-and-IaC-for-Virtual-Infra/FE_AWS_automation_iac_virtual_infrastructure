'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function PromptConfigBox() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResult(null)

    try {
      // const res = await fetch("/api/generate-config", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ prompt }),
      // })
      // const data = await res.json()
      // setResult(JSON.stringify(data, null, 2))
      // Mock result for demo
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
      const data = {
        message: 'This is a mock config generated from your prompt.',
        config: { Resources: '<AWS::S3::Bucket>', Properties: { BucketName: 'my-bucket' } },
      }
      setResult(JSON.stringify(data.message, null, 2))
    } catch (err) {
      console.error(err)
      setResult('❌ Error generating config')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-md gap-2">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent px-2">
          Generate Config by Prompt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g: Create an Elastic Load Balancer with 2 subnets and enable IPv6"
          className="min-h-[150px]"
        />
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            'Generate Config'
          )}
        </Button>
        {result && (
          <div className="p-3 rounded-lg bg-secondary text-secondary-foreground text-sm">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
