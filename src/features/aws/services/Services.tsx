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
import { SERVICE_STATUS } from '@/constants/common'
import { isExpiredDeployment } from '@/utils/storage'
import { format } from 'date-fns'
import { Activity, Server, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import MetricModal from './components/MetricModal'
import { fetchServices } from './libs/fetchers'
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
  const isDeploying = useMemo(() => isExpiredDeployment(), [])

  const [servicesData, setServicesData] = useState<ServiceData[]>(services)
  const [isLoading, setIsLoading] = useState(false)

  const [selectedService, setSelectedService] = useState<ServiceData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { runningServices, deletedServices } = useMemo(() => {
    return {
      runningServices: servicesData.filter((s) => s.status === SERVICE_STATUS.RUNNING),
      deletedServices: servicesData.filter((s) => s.status === SERVICE_STATUS.DELETED),
    }
  }, [servicesData])

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

  const handleReloadData = async () => {
    setIsLoading(true)
    const res = await fetchServices()
    if (res && res.items) {
      setServicesData(res.items)
    }
    setIsLoading(false)
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
              <div className="text-center text-gray-500 py-8 flex justify-center">
                {isDeploying ? (
                  <div className="flex flex-col items-center gap-6 max-w-md text-center">
                    {/* Animated Spinner */}
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Server className="w-8 h-8 text-blue-600 animate-pulse" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Deploying Infrastructure
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your services are being provisioned. This may take a few minutes...
                      </p>
                    </div>

                    {/* Refresh Button */}
                    <Button
                      variant="outline"
                      onClick={handleReloadData}
                      disabled={isLoading}
                      className="gap-2 min-w-[140px]"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          <span>Refreshing...</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4" />
                          <span>Refresh Status</span>
                        </>
                      )}
                    </Button>

                    {/* Estimated Time */}
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Estimated time: 3-5 minutes
                    </p>
                  </div>
                ) : (
                  <p>No running services</p>
                )}
              </div>
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
                          <span className="text-gray-400 text-sm">Unavailable</span>
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
                      <TableCell></TableCell>
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
