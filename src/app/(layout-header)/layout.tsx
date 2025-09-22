import Header from '@/components/Header'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  )
}
