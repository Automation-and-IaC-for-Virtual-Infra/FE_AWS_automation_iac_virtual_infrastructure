import { SERVICE_STATUS } from '@/constants/common'
import { createPageTitle, PAGE_TITLES } from '@/constants/route'
import { fetchServices, getAwsServices } from '@/features/aws/services/libs/fetchers'
import InfrastructureSetup from '@/features/infrastructure/setup/InfrastructureSetup'
import { getSessionNewest, getSpecBySessionId } from '@/features/infrastructure/setup/libs/fetchers'
import { InfraData } from '@/features/infrastructure/setup/libs/types'
import { WebSocketProvider } from '@/features/websocket'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: createPageTitle(PAGE_TITLES.INFRASTRUCTURE_SETUP),
}

// IMPORTANT: This page must be dynamic to always fetch the latest AWS services data
export const dynamic = 'force-dynamic'

export default async function InfrastructureSetupPage() {
  const res = await getAwsServices()
  const resServices = await fetchServices()

  let spec_json: InfraData | undefined = undefined
  let session_id = null
  if (resServices?.items) {
    // check at least one service is running
    const hasRunningService = resServices.items.some(
      (service) => service.status === SERVICE_STATUS.RUNNING
    )
    if (hasRunningService) {
      const resSession = await getSessionNewest()
      if (resSession?.session_id) {
        session_id = resSession.session_id
        const resSpec = await getSpecBySessionId(resSession.session_id)
        if (resSpec?.success) {
          spec_json = resSpec.spec || undefined
        }
      }
    }
  }

  if (!res.success || !res.data) {
    throw new Error(res.error?.message || 'Failed to load AWS services')
  }

  return (
    <WebSocketProvider>
      <InfrastructureSetup result={res.data} session_id={session_id} spec_json={spec_json} />
    </WebSocketProvider>
  )
}
