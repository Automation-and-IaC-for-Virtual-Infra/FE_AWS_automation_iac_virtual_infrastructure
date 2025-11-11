import { createPageTitle, PAGE_TITLES } from '@/constants/route'
import { AwsVerification } from '@/features/aws/verification/AwsVerification'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: createPageTitle(PAGE_TITLES.AWS_VERIFICATION),
}

export default function AwsVerificationPage() {
  return <AwsVerification />
}
