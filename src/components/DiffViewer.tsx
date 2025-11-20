import React, { useMemo } from 'react'
import { DiffEditor } from '@monaco-editor/react'

type DiffOp = {
  op: 'equal' | 'insert' | 'delete'
  text: string
}

type FileDiff = {
  file_name: string
  file_content: string
  diff: DiffOp[]
}

interface Props {
  data: FileDiff
}

const DiffViewer: React.FC<Props> = ({ data }) => {
  const modified = useMemo(() => {
    return data.diff
      .filter((d) => d.op === 'equal' || d.op === 'insert')
      .map((d) => d.text)
      .join('')
  }, [data])

  return (
    <DiffEditor
      original={data.file_content}
      modified={modified}
      language="hcl"
      theme="vs-dark"
      options={{ renderSideBySide: true, readOnly: true }}
    />
  )
}

export default DiffViewer
