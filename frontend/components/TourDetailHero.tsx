import type { Tour } from '@/types'

interface TourDetailHeroProps {
  tour: Tour
}

export default function TourDetailHero({ tour }: TourDetailHeroProps) {
  return (
    <section className="relative h-[60vh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
      <img
        src={tour.imageCover}
        alt={tour.name}
        className="object-cover w-full h-full"
      />

      <div className="absolute bottom-12 left-12 text-white">
        <h1 className="text-5xl font-bold mb-4">{tour.name} tour</h1>
        <div className="flex items-center gap-6 text-lg">
          <div className="flex items-center gap-2">
            <span>⏱</span>
            <span>{tour.duration} days</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{tour.startLocation.description}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
