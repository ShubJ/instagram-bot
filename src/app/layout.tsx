import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

/** Application-level metadata for SEO and browser tab display. */
export const metadata: Metadata = {
  title: 'Instagram Bot',
  description: 'Schedule and manage your Instagram posts with ease.',
}

/**
 * Root layout component.
 *
 * Wraps the entire application with the base HTML structure,
 * global font (Inter), and Tailwind CSS styles imported via
 * `globals.css`. All pages and nested layouts render as `{children}`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
