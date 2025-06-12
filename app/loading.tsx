import { RefreshCw } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-700">Loading dashboard...</h2>
        <p className="text-gray-500">Please wait while we prepare your data</p>
      </div>
    </div>
  )
}
