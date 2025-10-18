import type { Metadata, Viewport } from 'next'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { AuthProvider } from '@/lib/auth-context'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase:
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : new URL('http://localhost:3000'),
  title: 'KWN - 대한복지뉴스',
  description: 'KWN - 대한복지뉴스',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KWN - 대한복지뉴스',
    description: 'KWN - 대한복지뉴스',
    siteName: 'KWN - 대한복지뉴스',
    locale: 'ko_KR',
    type: 'website',
    url: '/',
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'kwn' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KWN - 대한복지뉴스',
    description: 'KWN - 대한복지뉴스',
    images: ['/og.svg'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased">
        <AuthProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  )
}
