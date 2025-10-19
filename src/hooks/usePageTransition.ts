'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function usePageTransition() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const pushTransition = (url: string) => {
    startTransition(() => {
      router.push(url)
    })
  }

  return { isPending, pushTransition }
}
