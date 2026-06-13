'use client'

import { useEffect, useRef } from 'react'
import type { TourLocation } from '@/types'

interface MapProps {
  locations: TourLocation[]
}

export default function Map({ locations }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !locations.length) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    async function initMap() {
      const L = await import('leaflet')

      const map = L.map(containerRef.current!).setView([20, 0], 2)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      const bounds = new L.LatLngBounds([])

      locations.forEach((loc) => {
        const [lng, lat] = loc.coordinates
        const marker = L.marker([lat, lng]).addTo(map)

        if (loc.description) {
          marker.bindPopup(
            `<b>Day ${loc.day}</b><br/>${loc.description}`,
          )
        }

        bounds.extend([lat, lng])
      })

      if (locations.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50] })
      } else {
        map.setZoom(10)
      }
    }

    initMap()

    return () => {
      link.remove()
    }
  }, [locations])

  if (!locations.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No locations available</p>
      </div>
    )
  }

  return (
    <section className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <div ref={containerRef} className="h-[400px] rounded-lg shadow-lg" />
      </div>
    </section>
  )
}
