import { ServiceData } from './types'

export const filterServicesHasMetrics = (services: Array<ServiceData>) => {
  return services.filter((service) => {
    const id = service.service_id.toLowerCase()
    const name = service.name.toLowerCase()
    const ec2 = id.includes('i-') || name.includes('ec2') || name.includes('instance')
    const rds = id.includes('db-') || name.includes('rds') || name.includes('database')
    const ebs = id.includes('vol-') || name.includes('ebs') || name.includes('volume')
    return ec2 || rds || ebs
  })
}
