"use client"

import { SectionSemestersList } from "@/components/section-admin/section-semesters-list"

export default function SectionAdminSemestersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">All Semesters</h2>
        <p className="text-muted-foreground">View and manage all semesters for your section</p>
      </div>
      
      <SectionSemestersList />
    </div>
  )
}
