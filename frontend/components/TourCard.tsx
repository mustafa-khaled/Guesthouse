import Link from 'next/link'
import type { Tour } from '@/types'

interface TourCardProps {
  tour: Tour
}

export default function TourCard({ tour }: TourCardProps) {
  const startDate = new Date(tour.startDates[0]).toLocaleDateString('en-us', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <img
          src={tour.imageCover}
          alt={tour.name}
          className="object-cover w-full h-full"
        />
        <h3 className="absolute bottom-3 left-3 text-white text-xl font-bold">
          {tour.name}
        </h3>
      </div>

      <div className="p-5">
        <h4 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
          {tour.difficulty} {tour.duration}-day tour
        </h4>
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">
          {tour.summary}
        </p>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{tour.startLocation.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{startDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚩</span>
            <span>{tour.locations.length} stops</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>{tour.maxGroupSize} people</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t">
        <div>
          <span className="text-2xl font-bold text-green-600">
            ${tour.price}
          </span>
          <span className="text-sm text-gray-500"> per person</span>
        </div>
        <div className="text-right">
          <div className="font-semibold">{tour.ratingsAverage}</div>
          <div className="text-xs text-gray-500">
            rating ({tour.ratingsQuantity})
          </div>
        </div>
        <Link
          href={`/tours/${tour.slug}`}
          className="px-4 py-2 text-sm text-white bg-green-600 rounded-full hover:bg-green-700"
        >
          Details
        </Link>
      </div>
    </div>
  )
}
