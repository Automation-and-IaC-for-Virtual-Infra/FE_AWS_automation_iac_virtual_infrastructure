'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Metrics from '../../metrics/Metrics'
import { ServiceData } from '../libs/types'

type MetricResult = {
  Label: string
  Timestamps: string[]
  Values: number[]
}

interface MetricModalProps {
  isOpen: boolean
  onClose: () => void
  service: ServiceData | null
  metrics: MetricResult[]
}

export default function MetricModal({ isOpen, onClose, service, metrics }: MetricModalProps) {
  if (!service) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Metrics - {service.name}</DialogTitle>
        </DialogHeader>
        <Metrics service={service} metrics={metrics} />
      </DialogContent>
    </Dialog>
  )
}
