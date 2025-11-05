import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import Editor from '@monaco-editor/react'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'

interface TerraformFile {
  name: string
  content: string
}

export function PreviewTerraformModal({
  open,
  onClose,
  files = [],
  loading = false,
}: {
  open: boolean
  onClose: () => void
  files: TerraformFile[]
  loading?: boolean
}) {
  const [selectedFile, setSelectedFile] = useState<TerraformFile | null>(null)
  const [code, setCode] = useState<string | null>(null)

  const handleApply = () => {
    console.log('Applying Terraform configuration...')
  }

  const handleDownload = () => {
    if (!selectedFile) return
    const element = document.createElement('a')
    const file = new Blob([selectedFile.content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = selectedFile.name
    document.body.appendChild(element)
    element.click()
  }

  useEffect(() => {
    if (files.length > 0) {
      setSelectedFile(files[0])
      setCode(files[0].content)
    }
  }, [files])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle> </DialogTitle>
      <DialogContent className="w-screen h-screen p-0 !max-w-screen [&_button:has(svg.lucide-x)]:hidden">
        {loading && files.length === 0 ? (
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
                    key={file.name}
                    className={`cursor-pointer rounded px-2 py-1 ${
                      selectedFile?.name === file.name
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => {
                      setSelectedFile(file)
                      setCode(file.content)
                    }}
                  >
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center p-2 border-b bg-background">
                <div className="text-sm font-medium">{selectedFile?.name}</div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    Download
                  </Button>
                  <Button size="sm" className="bg-green-600 text-white" onClick={handleApply}>
                    Apply
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
