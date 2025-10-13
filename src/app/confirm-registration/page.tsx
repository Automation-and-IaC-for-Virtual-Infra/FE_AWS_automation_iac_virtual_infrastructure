import { Spinner } from '@/components/ui/spinner'
import ConfirmRegistration from '@/features/auth/ConfirmRegistration'
import { Suspense } from 'react'

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
