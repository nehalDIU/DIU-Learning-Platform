"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Semester {
  id: string
  title: string
  section: string
  is_active: boolean
  description?: string
}

interface StudentUser {
  id: string
  userId: string
  email: string
  fullName?: string
  batch?: string
  section?: string
  sectionId?: string
  hasSkippedSelection: boolean
  profilePhotoUrl?: string
  phone?: string
  studentId?: string
  createdAt: string
}

interface CreateUserData {
  email: string
  fullName?: string
  batch?: string
  section?: string
}

interface SectionContextType {
  // Section selection state
  selectedSection: Semester | null
  studentUser: StudentUser | null
  isLoading: boolean
  error: string | null

  // Actions
  createUserWithEmail: (userData: CreateUserData) => Promise<void>
  skipSectionSelection: () => Promise<void>
  clearSelection: () => void
  updateUserProfile: (updates: Partial<StudentUser>) => Promise<void>

  // Computed values
  isAuthenticated: boolean
  userId: string | null
}

const SectionContext = createContext<SectionContextType | undefined>(undefined)

interface SectionProviderProps {
  children: ReactNode
}

const STORAGE_KEYS = {
  SELECTED_SECTION: 'diu_selected_section',
  STUDENT_USER: 'diu_student_user'
}

export function SectionProvider({ children }: SectionProviderProps) {
  const [selectedSection, setSelectedSection] = useState<Semester | null>(null)
  const [studentUser, setStudentUser] = useState<StudentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load saved section and user data on mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedSection = localStorage.getItem(STORAGE_KEYS.SELECTED_SECTION)
        const savedUser = localStorage.getItem(STORAGE_KEYS.STUDENT_USER)

        if (savedSection) {
          const section = JSON.parse(savedSection)
          setSelectedSection(section)
        }

        if (savedUser) {
          const user = JSON.parse(savedUser)
          setStudentUser(user)
        }
      } catch (err) {
        console.error('Error loading saved section data:', err)
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEYS.SELECTED_SECTION)
        localStorage.removeItem(STORAGE_KEYS.STUDENT_USER)
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedData()
  }, [])

  // Create user with email and batch/section information
  const createUserWithEmail = async (userData: CreateUserData): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      // For simplified form, we don't need to find specific section
      // The batch is enough to identify the user's group
      let sectionId = null
      let selectedSemester = null

      const response = await fetch('/api/student-users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          fullName: userData.fullName || '', // Will be auto-generated from email if empty
          batch: userData.batch,
          section: userData.section || '', // Optional section
          sectionId: sectionId,
          hasSkippedSelection: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)

        if (errorData.needsSetup) {
          throw new Error(`Database setup required. Please run the SQL from setup-database.md in your Supabase dashboard.`)
        }

        if (errorData.setupInstructions) {
          throw new Error(`Database table missing. Please create the student_users table using the SQL provided in the setup guide.`)
        }

        throw new Error(errorData.error || `Failed to create user account (Status: ${response.status})`)
      }

      const data = await response.json()
      const user = data.studentUser

      // Update state
      setStudentUser(user)
      if (selectedSemester) {
        setSelectedSection(selectedSemester)
        localStorage.setItem(STORAGE_KEYS.SELECTED_SECTION, JSON.stringify(selectedSemester))
      }
      localStorage.setItem(STORAGE_KEYS.STUDENT_USER, JSON.stringify(user))

    } catch (err) {
      console.error('Error creating user:', err)
      setError(err instanceof Error ? err.message : 'Failed to create user account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Skip section selection and allow access to all content
  const skipSectionSelection = async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/student-users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `guest_${Date.now()}@temp.local`,
          fullName: 'Guest User',
          hasSkippedSelection: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Skip API Error:', errorData)

        if (errorData.needsSetup || errorData.setupInstructions) {
          throw new Error(`Database setup required. Please run the SQL from setup-database.md in your Supabase dashboard.`)
        }

        throw new Error(errorData.error || `Failed to create guest account (Status: ${response.status})`)
      }

      const data = await response.json()
      const user = data.studentUser

      // Update state
      setStudentUser(user)
      setSelectedSection(null)
      localStorage.setItem(STORAGE_KEYS.STUDENT_USER, JSON.stringify(user))
      localStorage.removeItem(STORAGE_KEYS.SELECTED_SECTION)

    } catch (err) {
      console.error('Error skipping selection:', err)
      setError(err instanceof Error ? err.message : 'Failed to skip selection')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile information
  const updateUserProfile = async (updates: Partial<StudentUser>): Promise<void> => {
    if (!studentUser?.userId) {
      throw new Error('No user logged in')
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/student-users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: studentUser.userId,
          ...updates
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const data = await response.json()
      const updatedUser = data.studentUser

      // Update state and localStorage
      setStudentUser(updatedUser)
      localStorage.setItem(STORAGE_KEYS.STUDENT_USER, JSON.stringify(updatedUser))

    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Clear selection and logout
  const clearSelection = () => {
    setSelectedSection(null)
    setStudentUser(null)
    setError(null)

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.SELECTED_SECTION)
    localStorage.removeItem(STORAGE_KEYS.STUDENT_USER)
  }



  // Computed values
  // User is authenticated if they have a student user record (simplified form)
  const isAuthenticated = !!studentUser
  const userId = studentUser?.userId || null

  const contextValue: SectionContextType = {
    // State
    selectedSection,
    studentUser,
    isLoading,
    error,

    // Actions
    createUserWithEmail,
    skipSectionSelection,
    clearSelection,
    updateUserProfile,

    // Computed values
    isAuthenticated,
    userId
  }

  return (
    <SectionContext.Provider value={contextValue}>
      {children}
    </SectionContext.Provider>
  )
}

export function useSectionContext() {
  const context = useContext(SectionContext)
  
  if (context === undefined) {
    throw new Error('useSectionContext must be used within a SectionProvider')
  }
  
  return context
}

// Hook for getting the current user ID (for use with enrollment system)
export function useStudentUserId() {
  const { userId, isAuthenticated } = useSectionContext()
  return isAuthenticated ? userId : null
}
