
import type { JSX, ReactNode } from 'react'
import { Header } from './Header'
import { useLocation } from 'react-router-dom'

export function Layout({ children }: { children: ReactNode }): JSX.Element {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? "" : "mx-auto max-w-7xl px-4 py-6"}>
        {children}
      </main>
    </div>
  )
}