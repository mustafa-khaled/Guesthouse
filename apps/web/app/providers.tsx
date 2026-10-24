'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/providers/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider';

const toastStyle = {
  background: 'var(--surface-raised)',
  color: 'var(--ink)',
  border: '1px solid var(--line)',
  borderRadius: '4px',
  boxShadow: 'var(--shadow-soft)',
  fontSize: '14px',
  padding: '12px 14px',
} as const;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: toastStyle,
          success: { iconTheme: { primary: 'var(--brand)', secondary: 'var(--surface-raised)' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--surface-raised)' } },
        }}
      />
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
