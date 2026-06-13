import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import TourCard from '@/components/TourCard'
import { BACKEND_URL } from '@/lib/constants'
import type { ApiResponse, Booking, Tour } from '@/types'

export const metadata: Metadata = {
  title: 'My tours',
}

async function getMyTours(
  jwt: string | undefined,
): Promise<Tour[]> {
  if (!jwt) return []

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/bookings`, {
      headers: { Cookie: `jwt=${jwt}` },
      cache: 'no-store',
    })

    if (!res.ok) return []

    const data: ApiResponse<Booking[]> = await res.json()
    return (data.data?.data || []).map((booking) => booking.tour)
  } catch {
    return []
  }
}

export default async function MyToursPage() {
  const cookieStore = await cookies()
  const jwt = cookieStore.get('jwt')?.value
  const tours = await getMyTours(jwt)

  return (
    <div className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          My tours
        </h1>

        {tours.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">You haven&apos;t booked any tours yet.</p>
            <a
              href="/"
              className="inline-block mt-4 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              Browse tours
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <TourCard key={tour._id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
