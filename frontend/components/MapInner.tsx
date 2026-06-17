'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapInnerProps {
  lat: number
  lng: number
  label?: string
}

export default function MapInner({ lat, lng, label }: MapInnerProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const map = L.map(mapRef.current).setView([lat, lng], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    L.marker([lat, lng]).addTo(map).bindPopup(label || 'Property location')

    return () => {
      map.remove()
    }
  }, [lat, lng, label])

  return <div ref={mapRef} className="h-64 w-full rounded-lg" />
}
