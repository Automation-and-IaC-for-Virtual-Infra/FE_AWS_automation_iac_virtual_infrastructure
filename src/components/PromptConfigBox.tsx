'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { handleSuggestConfig } from '@/features/infrastructure/setup/libs/actions'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function PromptConfigBox({
  prompt,
  setPrompt,
  message,
  setMessage,
  resourceType,
  onApplyConfig,
}: {
  prompt: string
  setPrompt: (value: string) => void
  message: string
  setMessage: (value: string) => void
  resourceType: string
  onApplyConfig: (config: { [key: string]: { value: any; type: string } }) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setMessage('')
    const res = await handleSuggestConfig(prompt, resourceType)
    if (res.success) {
      setMessage(res.message)
      onApplyConfig(res.suggestions)
    }

    setLoading(false)
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
          className="min-h-40 max-h-80 h-40"
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
        {message && (
          <div className="p-3 rounded-lg bg-secondary text-secondary-foreground text-sm">
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
