import AwsServices from '@/features/aws/AwsServices'
import { getAwsServices } from '@/features/aws/services/libs/fetchers'

export default async function AwsServicesPage() {
  const res = await getAwsServices()

  return (
    <>
      <AwsServices data={res} />
    </>
  )
}
