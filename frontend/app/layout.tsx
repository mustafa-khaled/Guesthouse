import type { Metadata } from 'next'
import { AuthProvider } from '@/providers/AuthProvider'
import { AlertProvider } from '@/providers/AlertProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Alert from '@/components/Alert'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Guesthouse',
    default: 'Guesthouse | Exciting tours for adventurous people',
  },
  description: 'Explore the world with Guesthouse',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css?family=Lato:300,300i,700"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <AlertProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Alert />
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
