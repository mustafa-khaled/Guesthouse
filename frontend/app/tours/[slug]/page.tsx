import { notFound } from 'next/navigation'
import TourDetailHero from '@/components/TourDetailHero'
import TourOverviewBox from '@/components/TourOverviewBox'
import ReviewCard from '@/components/ReviewCard'
import Map from '@/components/Map'
import BookTourButton from './BookTourButton'
import type { ApiResponse, Tour } from '@/types'
import { BACKEND_URL } from '@/lib/constants'

async function getTour(slug: string): Promise<Tour | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/v1/tours?slug=${slug}`,
      { cache: 'no-store' },
    )
    const data: ApiResponse<Tour[]> = await res.json()
    return data.data?.data?.[0] || null
  } catch {
    return null
  }
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tour = await getTour(slug)

  if (!tour) {
    notFound()
  }

  return (
    <div>
      <TourDetailHero tour={tour} />
      <TourOverviewBox tour={tour} />

      {tour.images.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {tour.images.map((img, i) => (
            <div key={i} className="overflow-hidden">
              <img
                src={img}
                alt={`${tour.name} ${i + 1}`}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </section>
      )}

      <Map locations={tour.locations} />

      {tour.reviews && tour.reviews.length > 0 && (
        <section className="py-16 px-8 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              What people are saying
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tour.reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-8 bg-green-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          What are you waiting for?
        </h2>
        <p className="text-lg mb-8">
          {tour.duration} days. 1 adventure. Infinite memories. Make it yours
          today!
        </p>
        <BookTourButton tourId={tour._id} />
      </section>
    </div>
  )
}
