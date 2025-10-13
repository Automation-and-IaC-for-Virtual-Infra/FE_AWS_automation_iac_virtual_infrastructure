import { getAwsServices } from '@/features/aws/services/libs/fetchers'
import InfrastructureSetup from '@/features/infrastructure/setup/InfrastructureSetup'

// IMPORTANT: This page must be dynamic to always fetch the latest AWS services data
export const dynamic = 'force-dynamic'

export default async function InfrastructureSetupPage() {
  const res = await getAwsServices()

  if (!res.success || !res.data) {
    throw new Error(res.error?.message || 'Failed to load AWS services')
  }

  return <InfrastructureSetup result={res.data} />
}
