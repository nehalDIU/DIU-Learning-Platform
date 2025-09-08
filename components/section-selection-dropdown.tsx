"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Check, ChevronDown, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Semester {
  id: string
  title: string
  section: string
  is_active: boolean
  description?: string
}

interface SectionSelectionDropdownProps {
  value?: string
  onValueChange: (sectionId: string, section: Semester) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SectionSelectionDropdown({
  value,
  onValueChange,
  placeholder = "Select your section...",
  className,
  disabled = false
}: SectionSelectionDropdownProps) {
  const [open, setOpen] = useState(false)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch semesters from the database
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/semesters/public')
        if (!response.ok) {
          throw new Error('Failed to fetch sections')
        }

        const data = await response.json()
        setSemesters(data)
      } catch (err) {
        console.error('Error fetching semesters:', err)
        setError(err instanceof Error ? err.message : 'Failed to load sections')
      } finally {
        setLoading(false)
      }
    }

    fetchSemesters()
  }, [])

  // Filter and sort semesters based on search query
  const filteredSemesters = useMemo(() => {
    if (!searchQuery.trim()) {
      return semesters.filter(semester => semester.is_active)
    }

    const query = searchQuery.toLowerCase()
    return semesters
      .filter(semester => 
        semester.is_active && (
          semester.section.toLowerCase().includes(query) ||
          semester.title.toLowerCase().includes(query) ||
          (semester.description && semester.description.toLowerCase().includes(query))
        )
      )
  }, [semesters, searchQuery])

  // Group sections by batch number for better organization
  const groupedSections = useMemo(() => {
    const groups: { [key: string]: Semester[] } = {}
    
    filteredSemesters.forEach(semester => {
      const batch = semester.section.split('_')[0]
      if (!groups[batch]) {
        groups[batch] = []
      }
      groups[batch].push(semester)
    })

    // Sort groups by batch number (descending - newest first)
    const sortedGroups = Object.keys(groups)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .reduce((acc, key) => {
        acc[key] = groups[key].sort((a, b) => a.section.localeCompare(b.section))
        return acc
      }, {} as { [key: string]: Semester[] })

    return sortedGroups
  }, [filteredSemesters])

  const selectedSemester = semesters.find(s => s.id === value)

  const formatSectionDisplay = (section: string) => {
    const [batch, sectionLetter] = section.split('_')
    return `Batch ${batch} - Section ${sectionLetter}`
  }

  const handleSelect = (semester: Semester) => {
    onValueChange(semester.id, semester)
    setOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Loading sections...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 p-3 border rounded-md bg-destructive/10 border-destructive/20">
        <span className="text-sm text-destructive">{error}</span>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto min-h-[2.5rem] px-3 py-2",
              !selectedSemester && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <div className="flex items-center space-x-2 flex-1 text-left">
              <Users className="h-4 w-4 shrink-0" />
              <div className="flex flex-col space-y-1 min-w-0 flex-1">
                {selectedSemester ? (
                  <>
                    <span className="font-medium text-sm">
                      {formatSectionDisplay(selectedSemester.section)}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {selectedSemester.title}
                    </span>
                  </>
                ) : (
                  <span className="text-sm">{placeholder}</span>
                )}
              </div>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search sections..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No sections found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search terms
                  </p>
                </div>
              </CommandEmpty>
              
              {Object.entries(groupedSections).map(([batch, sections]) => (
                <CommandGroup key={batch} heading={`Batch ${batch}`}>
                  {sections.map((semester) => (
                    <CommandItem
                      key={semester.id}
                      value={semester.section}
                      onSelect={() => handleSelect(semester)}
                      className="flex items-center justify-between p-3 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex flex-col space-y-1 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {formatSectionDisplay(semester.section)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {semester.section}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground truncate">
                            {semester.title}
                          </span>
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4 shrink-0",
                          value === semester.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
