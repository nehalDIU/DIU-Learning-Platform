import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from "@/components/theme-provider"
import { SectionProvider } from "@/contexts/SectionContext"
import "./globals.css"
import "@/components/multi-course-content-manager.css"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "DIU Learning Platform - Computer Science & Engineering",
    template: "%s | DIU Learning Platform"
  },
  description: "Access comprehensive learning materials, video lectures, slides, and study tools for Computer Science & Engineering courses at Daffodil International University (DIU). Enhance your academic journey with our optimized learning platform.",
  applicationName: "DIU Learning Platform",
  authors: [{ name: "DIU CSE Department" }],
  keywords: [
    "DIU", "Daffodil International University", "Computer Science", "Engineering",
    "Learning Platform", "Online Education", "Video Lectures", "Study Materials",
    "Course Content", "Academic Resources", "CSE", "Bangladesh", "University",
    "Slides", "Study Tools", "Educational Technology", "E-Learning"
  ],
  generator: "DIU Learning Platform",
  creator: "DIU CSE Department",
  publisher: "Daffodil International University",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "DIU Learning Platform - Computer Science & Engineering",
    description: "Access comprehensive learning materials, video lectures, slides, and study tools for Computer Science & Engineering courses at Daffodil International University.",
    type: "website",
    siteName: "DIU Learning Platform",
    locale: "en_US",
    url: "https://diu-learning.vercel.app",
    images: [
      {
        url: "/images/diu-logo.png",
        width: 1200,
        height: 630,
        alt: "DIU Learning Platform - Computer Science & Engineering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DIU Learning Platform - Computer Science & Engineering",
    description: "Access comprehensive learning materials, video lectures, slides, and study tools for CSE courses at DIU.",
    creator: "@DIU_Official",
    images: ["/images/diu-logo.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://diu-learning.vercel.app",
  },
  category: "education",
  classification: "Educational Platform",
  metadataBase: new URL('https://diu-learning.vercel.app'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://drive.google.com" />
        <link rel="preconnect" href="https://youtube.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//drive.google.com" />
        <link rel="dns-prefetch" href="//youtube.com" />

        {/* App icons and manifest */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme colors */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />

        {/* Mobile app capabilities */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DIU Learning" />
        <meta name="format-detection" content="telephone=no" />

        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "DIU Learning Platform",
              "description": "Computer Science & Engineering learning platform for Daffodil International University students",
              "url": "https://diu-learning.vercel.app",
              "logo": "https://diu-learning.vercel.app/images/diu-logo.png",
              "sameAs": [
                "https://daffodilvarsity.edu.bd",
                "https://facebook.com/daffodilvarsity",
                "https://twitter.com/DIU_Official"
              ],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "102/1, Shukrabad",
                "addressLocality": "Mirpur Road",
                "addressRegion": "Dhaka",
                "postalCode": "1207",
                "addressCountry": "BD"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+880-2-9138234",
                "contactType": "customer service"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <SectionProvider>
            <div className="relative flex min-h-screen flex-col">{children}</div>
          </SectionProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
