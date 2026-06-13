'use client'

import { createContext, type ReactNode } from 'react'
import toast from 'react-hot-toast'

interface AlertContextType {
  showAlert: (type: 'success' | 'error', message: string) => void
}

export const AlertContext = createContext<AlertContextType | null>(null)

export function AlertProvider({ children }: { children: ReactNode }) {
  const showAlert = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message)
    } else {
      toast.error(message)
    }
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
    </AlertContext.Provider>
  )
}
