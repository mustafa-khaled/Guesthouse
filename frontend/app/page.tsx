import TourCard from '@/components/TourCard'
import type { ApiResponse, Tour } from '@/types'
import { BACKEND_URL } from '@/lib/constants'

async function getTours(): Promise<Tour[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/tours`, {
      cache: 'no-store',
    })
    const data: ApiResponse<Tour[]> = await res.json()
    return data.data?.data || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const tours = await getTours()

  return (
    <main className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        {tours.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No tours available at the moment.</p>
            <p className="text-sm mt-2">
              Make sure the backend server is running.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <TourCard key={tour._id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
