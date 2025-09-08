"use client"

import { Header } from "@/components/header"

export default function ContributorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Contributors</h1>
          <p className="text-muted-foreground">
            Meet the dedicated team behind the DIU Learning Platform development and content creation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="group p-6 rounded-lg transition-all duration-300 hover:bg-accent/30 cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
                <span className="font-semibold text-primary">DR</span>
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors duration-300">Dr. Mohammad Rahman</h3>
                <p className="text-sm text-muted-foreground">Project Lead</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              Leading the platform architecture and database design for the DIU Learning Platform.
            </p>
          </div>

          <div className="group p-6 rounded-lg transition-all duration-300 hover:bg-accent/30 cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
                <span className="font-semibold text-primary">FA</span>
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors duration-300">Fatima Ahmed</h3>
                <p className="text-sm text-muted-foreground">Frontend Developer</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              Responsible for UI/UX design and React component development.
            </p>
          </div>

          <div className="group p-6 rounded-lg transition-all duration-300 hover:bg-accent/30 cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
                <span className="font-semibold text-primary">KH</span>
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors duration-300">Karim Hassan</h3>
                <p className="text-sm text-muted-foreground">Backend Developer</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              Handles API development and database optimization.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="max-w-md mx-auto p-8 rounded-lg group hover:bg-accent/20 transition-all duration-300">
            <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Want to Contribute?</h2>
            <p className="text-sm text-muted-foreground mb-6 group-hover:text-foreground/80 transition-colors duration-300">
              Join our team and help improve the DIU Learning Platform for all students.
            </p>
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 hover:scale-105 transition-all duration-200 font-medium">
              Get Involved
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
