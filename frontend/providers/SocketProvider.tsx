'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { SOCKET_URL } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'

interface SocketContextType {
  socket: Socket | null
  joinProperty: (propertyId: string) => void
  joinFrontDesk: (propertyId: string) => void
  joinHousekeeping: (propertyId: string) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  joinProperty: () => {},
  joinFrontDesk: () => {},
  joinHousekeeping: () => {},
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, hasRole } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!user || !hasRole('editor')) {
      socketRef.current?.disconnect()
      socketRef.current = null
      return
    }

    const socket = io(SOCKET_URL, {
      auth: async (cb) => {
        const res = await fetch('/api/auth/refresh', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          cb({ token: data.accessToken })
        }
      },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    const invalidate = (keys: string[]) => {
      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })
    }

    socket.on('booking:updated', () => invalidate(['bookings', 'front-desk']))
    socket.on('room:status-changed', () =>
      invalidate(['rooms', 'housekeeping', 'front-desk']),
    )
    socket.on('housekeeping:task-updated', () => invalidate(['housekeeping']))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user, hasRole, queryClient])

  const joinProperty = useCallback((propertyId: string) => {
    socketRef.current?.emit('join:property', propertyId)
  }, [])

  const joinFrontDesk = useCallback((propertyId: string) => {
    socketRef.current?.emit('join:front-desk', propertyId)
  }, [])

  const joinHousekeeping = useCallback((propertyId: string) => {
    socketRef.current?.emit('join:housekeeping', propertyId)
  }, [])

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        joinProperty,
        joinFrontDesk,
        joinHousekeeping,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
