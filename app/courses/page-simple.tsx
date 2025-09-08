"use client"

import React from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Course Catalog
        </h1>
        <p className="text-muted-foreground mb-8">
          Discover and enroll in courses to enhance your learning journey.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The course catalog is being built. Please check back soon!</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
