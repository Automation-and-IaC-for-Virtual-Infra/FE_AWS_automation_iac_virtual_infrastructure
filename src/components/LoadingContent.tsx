import { Spinner } from './ui/spinner'

export default function LoadingContent({
  children,
  loading,
}: {
  children: React.ReactNode
  loading: boolean
}) {
  return (
    <div className="w-full relative min-h-70 max-h-screen">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  )
}
