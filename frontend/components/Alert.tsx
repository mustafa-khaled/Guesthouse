'use client'

import { Toaster } from 'react-hot-toast'

export default function Alert() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          borderRadius: '8px',
          padding: '12px 16px',
        },
        success: {
          style: {
            background: '#22c55e',
            color: 'white',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: 'white',
          },
        },
      }}
    />
  )
}
