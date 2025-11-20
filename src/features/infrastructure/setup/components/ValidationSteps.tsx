'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Loader2,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

export interface ValidationStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'success' | 'warning' | 'error'
  details?: string
  order: number
}

interface ValidationStepsProps {
  steps: ValidationStep[]
  className?: string
}

export function ValidationSteps({ steps, className }: ValidationStepsProps) {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([])

  const sortedSteps = steps.sort((a, b) => a.order - b.order)

  const getStatusIcon = (status: ValidationStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ValidationStep['status']) => {
    switch (status) {
      case 'running':
        return (
          <Badge variant="secondary" className="text-xs">
            Running
          </Badge>
        )
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
            Success
          </Badge>
        )
      case 'warning':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
            Warning
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive" className="text-xs">
            Error
          </Badge>
        )
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Pending
          </Badge>
        )
    }
  }

  const getStatusColor = (status: ValidationStep['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-200 bg-blue-50/50'
      case 'success':
        return 'border-green-200 bg-green-50/50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50'
      case 'error':
        return 'border-red-200 bg-red-50/50'
      case 'pending':
      default:
        return 'border-gray-200 bg-gray-50/50'
    }
  }

  return (
    <Card className={cn('w-full p-0', className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Validation Steps</h3>

          {sortedSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-all duration-200',
                getStatusColor(step.status),
                step.status === 'running' && 'shadow-sm',
                step.status === 'error' && 'shadow-sm'
              )}
            >
              {/* Step Number */}
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600 flex-shrink-0 mt-0.5">
                {index + 1}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-medium text-sm text-gray-900 truncate">{step.name}</h4>
                  {getStatusBadge(step.status)}
                </div>

                <div
                  className="flex gap-2 cursor-pointer items-center h-6"
                  onClick={() =>
                    setExpandedSteps((prev) =>
                      prev.includes(step.id)
                        ? prev.filter((id) => id !== step.id)
                        : [...prev, step.id]
                    )
                  }
                >
                  <p className="text-xs text-gray-600">{step.description}</p>
                  <div className="size-4 flex justify-center items-center hover:bg-gray-100 rounded mt-1">
                    {expandedSteps.includes(step.id) ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                {expandedSteps.includes(step.id) && step.details && (
                  <div className="mt-2 text-xs text-gray-500 bg-white/50 rounded p-2 border border-gray-200 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono">{step.details}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
