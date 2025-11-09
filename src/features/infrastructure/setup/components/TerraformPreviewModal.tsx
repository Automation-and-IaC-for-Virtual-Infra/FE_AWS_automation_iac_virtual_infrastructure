import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { LOCALSTORAGE_KEYS } from '@/constants/common'
import { ROUTES } from '@/constants/route'
import Editor from '@monaco-editor/react'
import { DialogTitle } from '@radix-ui/react-dialog'
import { Github, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { handlePushToRepository } from '../libs/actions'

interface TerraformFile {
  file_name: string
  file_content: string
}

export function PreviewTerraformModal({
  open,
  onClose,
  sessionId,
  files = [],
  loading = false,
}: {
  open: boolean
  onClose: () => void
  sessionId: string
  files: TerraformFile[]
  loading?: boolean
}) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<TerraformFile | null>(null)
  const [code, setCode] = useState<string | null>(null)

  const handleFormatCode = () => {
    if (!code) return

    // HCL/Terraform formatting rules
    const formatted = code
      .split('\n')
      .map((line) => line.trimEnd()) // Remove trailing whitespace
      .join('\n')

    // Add proper indentation
    let indent = 0
    const lines: string[] = []

    formatted.split('\n').forEach((line) => {
      const trimmed = line.trim()

      // Skip empty lines
      if (!trimmed) {
        lines.push('')
        return
      }

      // Decrease indent before closing braces
      if (trimmed.startsWith('}')) {
        indent = Math.max(0, indent - 1)
      }

      // Add indented line
      const indented = '  '.repeat(indent) + trimmed

      // Increase indent after opening braces
      if (trimmed.endsWith('{')) {
        indent++
      }

      lines.push(indented)
    })

    // Format = signs alignment (optional)
    const formattedCode = lines
      .map((line) => {
        // Align = in resource blocks
        if (line.includes('=') && !line.trim().startsWith('#')) {
          const [key, ...rest] = line.split('=')
          const value = rest.join('=').trim()
          const indent = line.match(/^\s*/)?.[0] || ''
          return `${indent}${key.trim()} = ${value}`
        }
        return line
      })
      .join('\n')

    setCode(formattedCode)

    // Update selected file
    if (selectedFile) {
      setSelectedFile({
        ...selectedFile,
        file_content: formattedCode,
      })
    }
  }

  const onPushToRepo = async () => {
    setIsLoading(true)
    console.log('Pushing Terraform configuration to repository...')
    const res = await handlePushToRepository(sessionId)
    if (res.success) {
      localStorage.setItem(LOCALSTORAGE_KEYS.IS_DEPLOYING, 'true')
      localStorage.setItem(LOCALSTORAGE_KEYS.CREATED_AT_DEPLOYMENT, new Date().toISOString())
      setIsLoading(false)
      toast.success('Successfully pushed to repository!')
      router.push(ROUTES.SERVICES)
    }
  }

  const handleDownload = () => {
    if (!selectedFile) return
    const element = document.createElement('a')
    const file = new Blob([selectedFile.file_content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = selectedFile.file_name
    document.body.appendChild(element)
    element.click()
  }

  useEffect(() => {
    if (files.length > 0) {
      setSelectedFile(files[0])
      setCode(files[0].file_content)
    }
  }, [files])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle> </DialogTitle>
      <DialogContent className="w-screen h-screen p-0 !max-w-screen [&_button:has(svg.lucide-x)]:hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/40 p-4">
              <h2 className="font-semibold mb-3">Terraform Files</h2>
              <ul className="space-y-2">
                {files.map((file) => (
                  <li
                    key={file.file_name}
                    className={`cursor-pointer rounded px-2 py-1 ${
                      selectedFile?.file_name === file.file_name
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => {
                      setSelectedFile(file)
                      setCode(file.file_content)
                    }}
                  >
                    {file.file_name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center p-2 border-b bg-background">
                <div className="text-sm font-medium">{selectedFile?.file_name}</div>
                <div className="space-x-2 flex items-center">
                  <Button size="sm" variant="outline" onClick={handleFormatCode}>
                    <Sparkles />
                    Format Code
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    Download
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 text-white"
                    onClick={onPushToRepo}
                    disabled={isLoading}
                  >
                    <Github />
                    {isLoading ? 'Pushing...' : 'Push to Repo'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
              <Editor
                height="100%"
                defaultLanguage="hcl"
                value={code || ''}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
