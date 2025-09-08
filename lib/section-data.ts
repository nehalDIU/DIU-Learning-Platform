// Section data management for SectionAdmin signup and management

export interface SectionData {
  value: string
  label: string
  batch: number
  sectionLetter: string
  description?: string
}

// Generate sections for multiple batches and section letters
export function generateSections(): SectionData[] {
  const sections: SectionData[] = []
  
  // Common batches (adjust as needed for your institution)
  const batches = [59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]
  
  // Common section letters
  const sectionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  
  for (const batch of batches) {
    for (const letter of sectionLetters) {
      const sectionValue = `${batch}_${letter}`
      sections.push({
        value: sectionValue,
        label: `Batch ${batch} - Section ${letter}`,
        batch,
        sectionLetter: letter,
        description: `Students from batch ${batch}, section ${letter}`
      })
    }
  }
  
  return sections.sort((a, b) => {
    // Sort by batch first, then by section letter
    if (a.batch !== b.batch) {
      return b.batch - a.batch // Newer batches first
    }
    return a.sectionLetter.localeCompare(b.sectionLetter)
  })
}

// Get all available sections
export const AVAILABLE_SECTIONS = generateSections()

// Search sections by query
export function searchSections(query: string): SectionData[] {
  if (!query.trim()) {
    return AVAILABLE_SECTIONS
  }
  
  const searchTerm = query.toLowerCase().trim()
  
  return AVAILABLE_SECTIONS.filter(section => {
    return (
      section.value.toLowerCase().includes(searchTerm) ||
      section.label.toLowerCase().includes(searchTerm) ||
      section.batch.toString().includes(searchTerm) ||
      section.sectionLetter.toLowerCase().includes(searchTerm)
    )
  })
}

// Validate section format
export function validateSectionFormat(section: string): boolean {
  const sectionPattern = /^\d{2,3}_[A-Z]$/
  return sectionPattern.test(section)
}

// Parse section string to get batch and letter
export function parseSectionString(section: string): { batch: number; letter: string } | null {
  if (!validateSectionFormat(section)) {
    return null
  }
  
  const [batchStr, letter] = section.split('_')
  const batch = parseInt(batchStr, 10)
  
  if (isNaN(batch)) {
    return null
  }
  
  return { batch, letter }
}

// Get section display name
export function getSectionDisplayName(section: string): string {
  const parsed = parseSectionString(section)
  if (!parsed) {
    return section
  }
  
  return `Batch ${parsed.batch} - Section ${parsed.letter}`
}

// Check if section exists in available sections
export function isSectionAvailable(section: string): boolean {
  return AVAILABLE_SECTIONS.some(s => s.value === section)
}

// Get sections by batch
export function getSectionsByBatch(batch: number): SectionData[] {
  return AVAILABLE_SECTIONS.filter(section => section.batch === batch)
}

// Get unique batches
export function getUniqueBatches(): number[] {
  const batches = AVAILABLE_SECTIONS.map(section => section.batch)
  return [...new Set(batches)].sort((a, b) => b - a) // Newer batches first
}

// Get unique section letters
export function getUniqueSectionLetters(): string[] {
  const letters = AVAILABLE_SECTIONS.map(section => section.sectionLetter)
  return [...new Set(letters)].sort()
}

// Format section for display in forms
export function formatSectionForDisplay(section: string): string {
  const sectionData = AVAILABLE_SECTIONS.find(s => s.value === section)
  return sectionData ? sectionData.label : section
}

// Get recent sections (for quick access)
export function getRecentSections(limit: number = 10): SectionData[] {
  return AVAILABLE_SECTIONS.slice(0, limit)
}

// Section validation with detailed error messages
export function validateSectionWithMessage(section: string): { isValid: boolean; message?: string } {
  if (!section || !section.trim()) {
    return { isValid: false, message: "Section is required" }
  }
  
  if (!validateSectionFormat(section)) {
    return { 
      isValid: false, 
      message: "Section must be in format '{batch}_{section_letter}' (e.g., '63_G')" 
    }
  }
  
  if (!isSectionAvailable(section)) {
    return { 
      isValid: false, 
      message: "Selected section is not available. Please choose from the dropdown." 
    }
  }
  
  return { isValid: true }
}
