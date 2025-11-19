import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModalWarningProps {
  onClose: () => void
  onLeave: () => void
}

export default function ModalWarning({ onClose, onLeave }: ModalWarningProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold">Leave Infrastructure Chat?</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          You will lose the current conversation and generated specification. Are you sure you want
          to close?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onLeave}>
            Leave
          </Button>
        </div>
      </div>
    </div>
  )
}
