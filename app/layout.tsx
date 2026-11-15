import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Biz — Business operations workspace',
  description: 'Biz is a secure business workspace for team operations, business insights, and everyday work.',
  metadataBase: new URL('https://biz.azharhussain.net'),
  openGraph: {
    title: 'Biz — Business operations workspace',
    description: 'A secure, connected workspace for your people, operations, and business insights.',
    url: 'https://biz.azharhussain.net',
    siteName: 'Biz',
    type: 'website',
  },
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f8f8',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
