import type { Metadata } from 'next'
import { inter } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Typo Drums - Typographic Drum Machines',
  description: 'Interactive typographic drum machines powered by Tone.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}