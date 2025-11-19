import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { LOCALSTORAGE_KEYS } from '@/constants/common'
import { ROUTES } from '@/constants/route'
import Editor from '@monaco-editor/react'
import { DialogTitle } from '@radix-ui/react-dialog'
import DiffViewer from '@/components/DiffViewer'
import { Github, Sparkles, FileDiff, Check, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { handlePushToRepository, handleFixTerraform } from '../libs/actions'
import { cx } from 'class-variance-authority'

interface TerraformFile {
  file_name: string
  file_content: string
  is_diff?: boolean
  diff?: { op: 'equal' | 'insert' | 'delete'; text: string }[]
}

export function PreviewTerraformModal({
  open,
  onClose,
  sessionId,
  files = [],
  loading = false,
  showDiff = false,
}: {
  open: boolean
  onClose: () => void
  sessionId: string
  files: TerraformFile[]
  loading?: boolean
  showDiff?: boolean
}) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [filesState, setFilesState] = useState<TerraformFile[]>(files)
  const [selectedFile, setSelectedFile] = useState<TerraformFile | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'diff' | 'original'>('diff')

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

  const onApplyFix = async (newContent?: string) => {
    if (!selectedFile || !sessionId) return

    setIsLoading(true)
    try {
      const contentToApply = newContent || selectedFile.file_content
      const res = await handleFixTerraform(sessionId, selectedFile.file_name, contentToApply)
      if (res.success) {
        toast.success(`Successfully applied fix for ${selectedFile.file_name}`)
        const newFileState = {
          ...selectedFile,
          file_content: contentToApply,
          is_diff: false,
        }
        setSelectedFile(newFileState)
        setFilesState(prev => prev.map((file) => (file.file_name === selectedFile.file_name ? newFileState : file)))
      } else {
        toast.error('Failed to apply fix')
      }
    } catch {
      toast.error('Failed to apply fix')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseOriginal = () => {
    setViewMode('original')
    if (selectedFile?.file_content) {
      setCode(selectedFile.file_content)
    }
  }

  const handleUseDiff = () => {
    setViewMode('diff')
    if (selectedFile?.file_content) {
      setCode(selectedFile.file_content)
    }
  }

  const getModifiedContent = () => {
    if (!selectedFile?.diff) return selectedFile?.file_content || ''

    return selectedFile.diff
      .filter((d) => d.op === 'equal' || d.op === 'insert')
      .map((d) => d.text)
      .join('')
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
      setViewMode('diff')
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
                {filesState.map((file) => (
                  <li
                    key={file.file_name}
                    className={cx(
                      'cursor-pointer rounded px-2 py-1',
                      selectedFile?.file_name === file.file_name
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent',
                    )}
                    onClick={() => {
                      setSelectedFile(file)
                      setCode(file.file_content)
                      setViewMode('diff')
                    }}
                  >
                    {file.file_name}
                    {file.is_diff && (
                      <span className="ml-2 text-xs text-orange-500">
                        *
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Monaco Editor or DiffViewer */}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center p-2 border-b bg-background">
                <div className="text-sm font-medium flex items-center gap-2">
                  {showDiff && selectedFile?.is_diff && (
                    <FileDiff className="w-4 h-4 text-orange-500" />
                  )}
                  {selectedFile?.file_name}
                  {showDiff && selectedFile?.is_diff && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      {viewMode === 'diff' ? 'Modified' : 'Original'}
                    </span>
                  )}
                </div>
                <div className="space-x-2 flex items-center">
                  {showDiff && selectedFile?.is_diff ? (
                    <>
                      {viewMode === 'original' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleUseDiff}
                          disabled={isLoading}
                        >
                          <FileDiff />
                          Show diff
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleUseOriginal}
                          disabled={isLoading}
                        >
                          <RotateCcw />
                          Using original
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="bg-orange-600 text-white"
                        onClick={() =>
                          onApplyFix(
                            viewMode === 'diff' ? getModifiedContent() : selectedFile?.file_content
                          )
                        }
                        disabled={isLoading}
                      >
                        <Check />
                        {isLoading ? 'Applying...' : 'Apply'}
                      </Button>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>

              {showDiff && selectedFile?.is_diff && viewMode === 'diff' && selectedFile?.diff ? (
                <div className="flex-1">
                  <DiffViewer
                    data={{
                      file_name: selectedFile.file_name,
                      file_content: selectedFile.file_content || '',
                      diff: selectedFile.diff,
                    }}
                  />
                </div>
              ) : (
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
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
