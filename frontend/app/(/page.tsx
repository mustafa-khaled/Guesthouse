import { backendFetchApi } from '@/lib/api/server'
import type { Property, PaginatedResponse } from '@/types'
import { SearchBar } from '@/components/guest/SearchBar'
import { PropertyCardGrid } from '@/components/guest/PropertyCard'

export default async function HomePage() {
  let properties: Property[] = []
  try {
    const res = await backendFetchApi<PaginatedResponse<Property>>('/?limit=12')
    properties = res.data
  } catch {
    properties = []
  }

  return (
    <div>
      <section className="bg-green-700 px-4 py-16 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl">
            Find your perfect stay
          </h1>
          <p className="mt-4 text-lg text-green-100">
            Discover guesthouses and hotels around the world
          </p>
          <div className="mt-8">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">
          Featured properties
        </h2>
        {properties.length > 0 ? (
          <PropertyCardGrid properties={properties} />
        ) : (
          <p className="text-gray-500">
            No properties available yet. Check back soon!
          </p>
        )}
      </section>
    </div>
  )
}
