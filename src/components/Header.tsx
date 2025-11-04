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
import { cx } from 'class-variance-authority'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeSwitch } from './ThemeSwitch'

const navItems = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD },
  { name: 'Infrastructure', href: ROUTES.INFRASTRUCTURE },
  { name: 'Notifications', href: ROUTES.NOTIFICATIONS },
  { name: 'Services', href: ROUTES.SERVICES },
]

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

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
        <Link href="/">LOGO TEAM</Link>
      </div>

      {/* Nav menu */}
      <nav className="flex gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              'text-md font-medium transition-colors hover:text-blue-600',
              pathname === item.href ? 'text-blue-600' : 'text-gray-600',
              pathname === item.href ? 'underline underline-offset-4' : ''
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="flex items-center gap-4">
        <ThemeSwitch />

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
