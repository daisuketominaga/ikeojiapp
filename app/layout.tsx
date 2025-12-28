import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'イケオジ診断 | あなたの価値観を可視化',
  description: '15の質問であなたの深層心理を分析し、歴史上の偉人と比較。あなただけのイケオジタイプを診断します。',
  keywords: 'イケオジ, 診断, 価値観, 心理テスト, AI, 偉人',
  openGraph: {
    title: 'イケオジ診断 | あなたの価値観を可視化',
    description: '15の質問であなたの深層心理を分析し、歴史上の偉人と比較。あなただけのイケオジタイプを診断します。',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'イケオジ診断',
    description: 'あなたの深層心理を分析し、歴史上の偉人と比較',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f0f23',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
