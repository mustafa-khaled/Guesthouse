import type { Tour } from '@/types'

interface TourOverviewBoxProps {
  tour: Tour
}

export default function TourOverviewBox({ tour }: TourOverviewBoxProps) {
  const nextDate = new Date(tour.startDates[0]).toLocaleDateString('en-us', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className="py-16 px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Quick facts
            </h2>
            <div className="space-y-4">
              <OverviewRow label="Next date" value={nextDate} />
              <OverviewRow label="Difficulty" value={tour.difficulty} />
              <OverviewRow
                label="Participants"
                value={`${tour.maxGroupSize} people`}
              />
              <OverviewRow
                label="Rating"
                value={`${tour.ratingsAverage} / 5`}
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Your tour guides
            </h2>
            <div className="space-y-4">
              {tour.guides?.map((guide) => (
                <div key={guide._id} className="flex items-center gap-4">
                  <img
                    src={guide.photo}
                    alt={guide.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="text-sm text-gray-500">
                      {guide.role === 'lead-guide'
                        ? 'Lead Guide'
                        : 'Tour Guide'}
                    </div>
                    <div className="font-semibold">{guide.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            About {tour.name} tour
          </h2>
          {(tour.description || '').split('\n').map((paragraph, i) => (
            <p key={i} className="text-gray-600 mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

function OverviewRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-sm font-medium text-gray-500">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  )
}
