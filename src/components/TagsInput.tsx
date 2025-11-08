// components/TagsInput.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

export interface Tag {
  Key: string
  Value: string
}

interface TagsInputProps {
  value: Tag[]
  onChange: (tags: Tag[]) => void
  disabled?: boolean
}

export function TagsInput({ value = [], onChange, disabled }: TagsInputProps) {
  const [tags, setTags] = useState<Tag[]>(
    Array.isArray(value) && value.length > 0 ? value : [{ Key: '', Value: '' }]
  )

  const handleAddTag = () => {
    const newTags = [...tags, { Key: '', Value: '' }]
    setTags(newTags)
    onChange(newTags)
  }

  const handleRemoveTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index)
    setTags(newTags.length === 0 ? [{ Key: '', Value: '' }] : newTags)
    onChange(newTags.length === 0 ? [] : newTags)
  }

  const handleTagChange = (index: number, field: 'Key' | 'Value', value: string) => {
    const newTags = tags.map((tag, i) => (i === index ? { ...tag, [field]: value } : tag))
    setTags(newTags)
    onChange(newTags)
  }

  return (
    <div className="space-y-2">
      {tags.map((tag, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Key (e.g., Environment)"
              value={tag.Key}
              onChange={(e) => handleTagChange(index, 'Key', e.target.value)}
              className="text-sm"
              disabled={disabled}
            />
            <Input
              placeholder="Value (e.g., Production)"
              value={tag.Value}
              onChange={(e) => handleTagChange(index, 'Value', e.target.value)}
              className="text-sm"
              disabled={disabled}
            />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveTag(index)}
              className="mt-1 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
          <Plus className="w-4 h-4" />
          Add Tag
        </Button>
      )}
    </div>
  )
}
