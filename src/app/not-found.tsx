import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
        <h1 className="mb-2 text-6xl font-bold text-gray-800">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Page Not Found</h2>
        <p className="mb-6 text-gray-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}
