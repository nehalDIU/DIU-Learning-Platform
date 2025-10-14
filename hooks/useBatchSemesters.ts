"use client"

import { useState, useEffect, useCallback } from 'react'

interface Semester {
  id: string
  title: string
  section: string
  is_active: boolean
  description?: string
  created_at?: string
  updated_at?: string
}

interface Batch {
  batch: string
  sections: string[]
  sampleTitle: string
  displayName: string
}

interface BatchSemestersResponse {
  batch: string
  semesters: Semester[]
  count: number
}

interface UseBatchSemestersReturn {
  // State
  selectedBatch: string | null
  availableBatches: Batch[]
  semesters: Semester[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setSelectedBatch: (batch: string | null) => void
  refreshBatches: () => Promise<void>
  refreshSemesters: () => Promise<void>
  
  // Computed values
  hasSemesters: boolean
  semesterCount: number
}

export function useBatchSemesters(initialBatch?: string): UseBatchSemestersReturn {
  const [selectedBatch, setSelectedBatchState] = useState<string | null>(initialBatch || null)
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available batches
  const fetchBatches = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/batches')
      
      if (!response.ok) {
        throw new Error('Failed to fetch batches')
      }
      
      const batches = await response.json()
      setAvailableBatches(batches)
      
      // If no batch is selected and we have batches, optionally select the first one
      if (!selectedBatch && batches.length > 0) {
        // Don't auto-select, let user choose
      }
    } catch (err) {
      console.error('Error fetching batches:', err)
      setError(err instanceof Error ? err.message : 'Failed to load batches')
    }
  }, [selectedBatch])

  // Fetch semesters for selected batch
  const fetchSemesters = useCallback(async (batch: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/semesters/by-batch/${batch}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch semesters for batch')
      }
      
      const data: BatchSemestersResponse = await response.json()
      setSemesters(data.semesters)
    } catch (err) {
      console.error('Error fetching semesters:', err)
      setError(err instanceof Error ? err.message : 'Failed to load semesters')
      setSemesters([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Set selected batch and fetch its semesters
  const setSelectedBatch = useCallback((batch: string | null) => {
    setSelectedBatchState(batch)
    
    if (batch) {
      fetchSemesters(batch)
    } else {
      setSemesters([])
    }
  }, [fetchSemesters])

  // Refresh functions
  const refreshBatches = useCallback(async () => {
    await fetchBatches()
  }, [fetchBatches])

  const refreshSemesters = useCallback(async () => {
    if (selectedBatch) {
      await fetchSemesters(selectedBatch)
    }
  }, [selectedBatch, fetchSemesters])

  // Load batches on mount
  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  // Load semesters when batch changes
  useEffect(() => {
    if (selectedBatch) {
      fetchSemesters(selectedBatch)
    } else {
      setSemesters([])
    }
  }, [selectedBatch, fetchSemesters])

  // Computed values
  const hasSemesters = semesters.length > 0
  const semesterCount = semesters.length

  return {
    // State
    selectedBatch,
    availableBatches,
    semesters,
    isLoading,
    error,
    
    // Actions
    setSelectedBatch,
    refreshBatches,
    refreshSemesters,
    
    // Computed values
    hasSemesters,
    semesterCount
  }
}
