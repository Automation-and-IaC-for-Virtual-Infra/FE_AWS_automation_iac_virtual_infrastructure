import { getAwsServices } from '@/features/aws/services/libs/fetchers'
import InfrastructureSetup from '@/features/infrastructure/setup/InfrastructureSetup'

export default async function InfrastructureSetupPage() {
  const res = await getAwsServices()

  return <InfrastructureSetup result={res} />
}
