import { AlertCircle } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 max-w-md">
        This feature is not implemented yet. Please check back later for updates.
      </p>
    </div>
  )
}

