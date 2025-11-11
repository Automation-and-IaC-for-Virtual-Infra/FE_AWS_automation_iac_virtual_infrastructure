import { Spinner } from '@/components/ui/spinner'
import { createPageTitle, PAGE_TITLES } from '@/constants/route'
import ConfirmRegistration from '@/features/auth/ConfirmRegistration'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: createPageTitle(PAGE_TITLES.CONFIRM_REGISTRATION),
}

export const dynamic = 'force-dynamic'

export default function ConfirmRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <ConfirmRegistration />
    </Suspense>
  )
}
