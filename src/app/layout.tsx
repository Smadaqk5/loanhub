import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation'
import { Toaster } from 'react-hot-toast'
import { PageTransition } from '@/components/PageTransition'

export const metadata: Metadata = {
  title: 'LoanHub Kenya - Secure Loan Lending Platform',
  description: 'A secure and transparent loan lending platform for Kenya with easy application process and flexible repayment options.',
  keywords: 'loans, kenya, lending, finance, mpesa, banking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans" suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
            <Navigation />
            <main className="flex-1">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}