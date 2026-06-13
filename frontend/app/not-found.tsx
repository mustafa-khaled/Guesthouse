import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <h2 className="text-4xl font-bold text-gray-800 mb-4">
        Uh oh! Something went wrong!
      </h2>
      <p className="text-gray-500 mb-8">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
      >
        Back to all tours
      </Link>
    </div>
  )
}
