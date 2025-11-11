'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/constants/route'
import { logoutAction } from '@/features/auth/lib/actions'
import { useNotifications } from '@/features/notification/context/NotificationContext'
import { cx } from 'class-variance-authority'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD },
  { name: 'Infrastructure', href: ROUTES.INFRASTRUCTURE_SETUP },
  { name: 'Services', href: ROUTES.SERVICES },
  { name: 'Notifications', href: ROUTES.NOTIFICATIONS },
]

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  const { unreadCount } = useNotifications()

  const handleSignOut = async () => {
    const res = await logoutAction()
    if (res.success) {
      router.push(ROUTES.LOGIN)
    }
  }

  return (
    <header className="w-full bg-white px-6 py-3 flex items-center justify-between border-b shadow-md h-16">
      {/* Logo */}
      <div className="font-bold text-xl text-blue-600">
        <Link href="/">
          <Image src="/logo-cropped.svg" alt="AWS Flow Logo" width={100} height={400} priority />
        </Link>
      </div>

      {/* Nav menu */}
      <nav className="flex gap-6">
        {navItems.map((item) => (
          <div key={item.href} className="relative">
            <Link
              href={item.href}
              className={cx(
                'text-md font-medium transition-colors hover:text-blue-600',
                pathname === item.href ? 'text-blue-600' : 'text-gray-600',
                pathname === item.href ? 'underline underline-offset-4' : ''
              )}
            >
              {item.name}
            </Link>

            {item.name === 'Notifications' && unreadCount > 0 && (
              <span className="absolute -top-1 -right-4 inline-flex items-center justify-center px-1 py-0.5 text-[10px] font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="flex items-center gap-4">
        {/* <ThemeSwitch /> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-amber-200 cursor-pointer">UN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild disabled>
              <div className="flex justify-between">
                <Link href="/settings">Settings</Link>
                <span className="text-xs text-gray-400 italic">Coming soon</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem asChild disabled>
              <div className="flex justify-between">
                <Link href="/profile">Profile</Link>
                <span className="text-xs text-gray-400 italic">Coming soon</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100">
              <Link href={ROUTES.AWS_VERIFICATION}>Aws Connections</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 cursor-pointer hover:bg-gray-100"
              onClick={handleSignOut}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
