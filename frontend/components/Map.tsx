'use client'

import dynamic from 'next/dynamic'

interface MapProps {
  lat: number
  lng: number
  label?: string
}

const MapInner = dynamic(() => import('./MapInner'), { ssr: false })

export default function Map({ lat, lng, label }: MapProps) {
  return <MapInner lat={lat} lng={lng} label={label} />
}
