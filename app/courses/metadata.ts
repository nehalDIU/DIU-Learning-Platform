import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Course Catalog - DIU Learning Platform",
  description: "Discover and enroll in Computer Science & Engineering courses at Daffodil International University. Access comprehensive course materials, video lectures, and interactive content.",
  keywords: [
    "DIU courses",
    "Computer Science courses",
    "Engineering courses",
    "Daffodil International University",
    "course enrollment",
    "online learning",
    "CSE courses",
    "university courses",
    "Bangladesh university",
    "course catalog"
  ],
  authors: [{ name: "DIU Learning Platform Team" }],
  creator: "Daffodil International University",
  publisher: "DIU Learning Platform",
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
    type: "website",
    locale: "en_US",
    url: "https://diu-learning.vercel.app/courses",
    title: "Course Catalog - DIU Learning Platform",
    description: "Discover and enroll in Computer Science & Engineering courses at Daffodil International University. Access comprehensive course materials, video lectures, and interactive content.",
    siteName: "DIU Learning Platform",
    images: [
      {
        url: "https://diu-learning.vercel.app/images/courses-og.jpg",
        width: 1200,
        height: 630,
        alt: "DIU Course Catalog - Computer Science & Engineering Courses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Course Catalog - DIU Learning Platform",
    description: "Discover and enroll in Computer Science & Engineering courses at Daffodil International University.",
    images: ["https://diu-learning.vercel.app/images/courses-og.jpg"],
    creator: "@DIUBangladesh",
  },
  alternates: {
    canonical: "https://diu-learning.vercel.app/courses",
  },
  other: {
    "application-name": "DIU Learning Platform",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "DIU Courses",
    "format-detection": "telephone=no",
  },
}
