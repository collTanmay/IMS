import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QuickActions } from '@/components/QuickActions'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InvenFlow - SME Manufacturing Suite',
  description: 'Streamlining Procurement, Sales, and Manufacturing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <QuickActions />
      </body>
    </html>
  )
}