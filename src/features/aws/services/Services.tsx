'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Activity, Server, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import MetricModal from './components/MetricModal'
import { ServiceData } from './libs/types'

type MetricResult = {
  Label: string
  Timestamps: string[]
  Values: number[]
}

export default function Services({
  services,
  metrics,
}: {
  services: ServiceData[]
  metrics: MetricResult[]
}) {
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { runningServices, deletedServices } = useMemo(() => {
    return {
      runningServices: services.filter((s) => s.status === 1),
      deletedServices: services.filter((s) => s.status === 2),
    }
  }, [services])

  const getMetricsForService = (serviceId: string) => {
    return metrics?.filter((m) => m.Label.includes(serviceId))
  }

  const hasMetrics = (serviceId: string) => {
    return getMetricsForService(serviceId)?.length ?? 0 > 0
  }

  const handleMetricsClick = (service: ServiceData) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedService(null)
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Running Services Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-green-600" />
              Running Services
              <Badge variant="default" className="bg-green-500 ml-2">
                {runningServices.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {runningServices.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No running services</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Name</TableHead>
                    <TableHead className="w-[200px]">Service ID</TableHead>
                    <TableHead className="w-[140px]">Public IP</TableHead>
                    <TableHead className="w-[140px]">Private IP</TableHead>
                    <TableHead className="w-[160px]">Created At</TableHead>
                    <TableHead className="w-[100px]">Metrics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runningServices.map((service) => (
                    <TableRow key={service.service_id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="font-mono text-sm">{service.service_id}</TableCell>
                      <TableCell>{service.public_ip}</TableCell>
                      <TableCell>{service.private_ip}</TableCell>
                      <TableCell>
                        {format(new Date(service.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {hasMetrics(service.service_id) ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMetricsClick(service)}
                            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-800 dark:hover:bg-blue-600"
                          >
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-200" />
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">No metrics</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Deleted Services Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Deleted Services
              <Badge variant="destructive" className="bg-red-500 ml-2">
                {deletedServices.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deletedServices.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No deleted services</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Name</TableHead>
                    <TableHead className="w-[200px]">Service ID</TableHead>
                    <TableHead className="w-[140px]">Public IP</TableHead>
                    <TableHead className="w-[140px]">Private IP</TableHead>
                    <TableHead className="w-[160px]">Deleted At</TableHead>
                    <TableHead className="w-[100px]">Metrics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedServices.map((service) => (
                    <TableRow key={service.service_id} className="opacity-60">
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="font-mono text-sm">{service.service_id}</TableCell>
                      <TableCell>{service.public_ip}</TableCell>
                      <TableCell>{service.private_ip}</TableCell>
                      <TableCell>
                        {format(new Date(service.updated_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-400 text-sm">No metrics</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <MetricModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        service={selectedService}
        metrics={selectedService ? getMetricsForService(selectedService.service_id) : []}
      />
    </>
  )
}
