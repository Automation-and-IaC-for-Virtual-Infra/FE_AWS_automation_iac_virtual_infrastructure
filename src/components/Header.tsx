'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { fetchNotifications } from '@/features/notification/libs/fetchers'
import { cx } from 'class-variance-authority'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD },
  { name: 'Infrastructure', href: ROUTES.INFRASTRUCTURE_SETUP },
  { name: 'Services', href: ROUTES.SERVICES },
  { name: 'Notifications', href: ROUTES.NOTIFICATIONS },
]

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  const [countUnread, setCountUnread] = useState(0)

  const handleSignOut = async () => {
    const res = await logoutAction()
    if (res.success) {
      router.push(ROUTES.LOGIN)
    }
  }

  const getNotifications = async () => {
    try {
      const response = await fetchNotifications({ page: 1, per_page: 10 })
      if (response.unread_count) {
        setCountUnread(response.unread_count || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // auto call notification each 1 hour
  useEffect(() => {
    getNotifications()
  }, [])

  return (
    <header className="w-full bg-white px-6 py-3 flex items-center justify-between border-b shadow-md h-16">
      {/* Logo */}
      <div className="font-bold text-xl text-blue-600">
        <Link href="/">
          <Image src="logo-cropped.svg" alt="AWS Flow Logo" width={100} height={400} priority />
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

            {item.name === 'Notifications' && countUnread > 0 && (
              <span className="absolute -top-1 -right-4 inline-flex items-center justify-center px-1 py-0.5 text-[10px] font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {countUnread}
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
                <AvatarImage src="/avatar.png" alt="@user" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
