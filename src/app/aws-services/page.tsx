import AwsServices from '@/features/aws/AwsServices'
import { getAwsServices } from '@/features/aws/libs/fetchers'
import { notFound } from 'next/navigation'

// TODO: this file for test CALL API get list services from AWS - remove later

export default async function AwsServicesPage() {
  const res = await getAwsServices()
  if (res.error) {
    notFound()
  }

  return (
    <>
      <AwsServices data={res} />
    </>
  )
}
