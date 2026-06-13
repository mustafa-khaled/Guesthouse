'use client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        Something went wrong!
      </h2>
      <p className="text-gray-500 mb-2">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
      >
        Try again
      </button>
    </div>
  )
}
