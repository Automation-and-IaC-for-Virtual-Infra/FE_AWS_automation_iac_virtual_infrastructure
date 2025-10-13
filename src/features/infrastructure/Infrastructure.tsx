import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/route'
import Link from 'next/link'

export default function Infrastructure() {
  return (
    <div className="flex flex-col p-4 size-full gap-2">
      <div className="w-full flex justify-end">
        <Link href={ROUTES.INFRASTRUCTURE_SETUP}>
          <Button>Setup Infrastructure</Button>
        </Link>
      </div>
      <div className="size-full justify-center items-center flex-1">
        <h1 className="text-center">Infrastructure Page</h1>
      </div>
    </div>
  )
}
