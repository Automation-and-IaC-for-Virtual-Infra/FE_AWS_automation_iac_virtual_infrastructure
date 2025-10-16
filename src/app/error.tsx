'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-6xl font-bold text-red-500">⚠️</h1>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Oops! Something went wrong</h2>
          <p className="text-gray-600">We encountered an unexpected error. Please try again.</p>
        </div>

        {error.message && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 size-full">
          <button
            onClick={reset}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-gray-700 transition-colors hover:bg-gray-50 h-10"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
