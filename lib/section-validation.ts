// Section format validation utilities for SectionAdmin authentication

import { AVAILABLE_SECTIONS, parseSectionString } from './section-data'

export interface ValidationResult {
  isValid: boolean
  message?: string
  code?: string
}

// Main section format validation
export function validateSectionFormat(section: string): ValidationResult {
  if (!section || typeof section !== 'string') {
    return {
      isValid: false,
      message: "Section is required",
      code: "SECTION_REQUIRED"
    }
  }

  const trimmedSection = section.trim()
  
  if (!trimmedSection) {
    return {
      isValid: false,
      message: "Section cannot be empty",
      code: "SECTION_EMPTY"
    }
  }

  // Check basic format: {batch}_{section_letter}
  const sectionPattern = /^\d{2,3}_[A-Z]$/
  if (!sectionPattern.test(trimmedSection)) {
    return {
      isValid: false,
      message: "Section must be in format '{batch}_{section_letter}' (e.g., '63_G')",
      code: "INVALID_FORMAT"
    }
  }

  // Parse and validate components
  const parsed = parseSectionString(trimmedSection)
  if (!parsed) {
    return {
      isValid: false,
      message: "Invalid section format",
      code: "PARSE_ERROR"
    }
  }

  // Validate batch range (reasonable range for academic batches)
  if (parsed.batch < 50 || parsed.batch > 99) {
    return {
      isValid: false,
      message: "Batch number must be between 50 and 99",
      code: "INVALID_BATCH_RANGE"
    }
  }

  // Validate section letter (A-Z only)
  if (!/^[A-Z]$/.test(parsed.letter)) {
    return {
      isValid: false,
      message: "Section letter must be a single uppercase letter (A-Z)",
      code: "INVALID_SECTION_LETTER"
    }
  }

  return {
    isValid: true,
    message: "Valid section format"
  }
}

// Check if section exists in available sections
export function validateSectionAvailability(section: string): ValidationResult {
  const formatValidation = validateSectionFormat(section)
  if (!formatValidation.isValid) {
    return formatValidation
  }

  const isAvailable = AVAILABLE_SECTIONS.some(s => s.value === section.trim())
  
  if (!isAvailable) {
    return {
      isValid: false,
      message: "Selected section is not available. Please choose from the dropdown.",
      code: "SECTION_NOT_AVAILABLE"
    }
  }

  return {
    isValid: true,
    message: "Section is available"
  }
}

// Comprehensive section validation for signup
export function validateSectionForSignup(section: string): ValidationResult {
  // First check format
  const formatValidation = validateSectionFormat(section)
  if (!formatValidation.isValid) {
    return formatValidation
  }

  // Then check availability
  const availabilityValidation = validateSectionAvailability(section)
  if (!availabilityValidation.isValid) {
    return availabilityValidation
  }

  return {
    isValid: true,
    message: "Section is valid and available"
  }
}

// Validate multiple sections (for bulk operations)
export function validateMultipleSections(sections: string[]): {
  isValid: boolean
  results: Array<{ section: string; validation: ValidationResult }>
  validSections: string[]
  invalidSections: string[]
} {
  const results = sections.map(section => ({
    section,
    validation: validateSectionForSignup(section)
  }))

  const validSections = results
    .filter(r => r.validation.isValid)
    .map(r => r.section)

  const invalidSections = results
    .filter(r => !r.validation.isValid)
    .map(r => r.section)

  return {
    isValid: invalidSections.length === 0,
    results,
    validSections,
    invalidSections
  }
}

// Get validation suggestions for invalid sections
export function getSectionSuggestions(invalidSection: string): string[] {
  if (!invalidSection || typeof invalidSection !== 'string') {
    return []
  }

  const trimmed = invalidSection.trim().toUpperCase()
  const suggestions: string[] = []

  // If it looks like a partial section, suggest completions
  if (/^\d{2,3}$/.test(trimmed)) {
    // Just a batch number, suggest adding section letters
    const batch = parseInt(trimmed, 10)
    if (batch >= 50 && batch <= 99) {
      suggestions.push(`${batch}_A`, `${batch}_B`, `${batch}_C`)
    }
  } else if (/^\d{2,3}_$/.test(trimmed)) {
    // Batch with underscore, suggest section letters
    const batch = trimmed.replace('_', '')
    suggestions.push(`${batch}A`, `${batch}B`, `${batch}C`)
  } else if (/^[A-Z]$/.test(trimmed)) {
    // Just a letter, suggest recent batches
    const recentBatches = [63, 64, 65, 66, 67]
    recentBatches.forEach(batch => {
      suggestions.push(`${batch}_${trimmed}`)
    })
  }

  // Filter suggestions to only include available sections
  return suggestions.filter(suggestion => 
    AVAILABLE_SECTIONS.some(s => s.value === suggestion)
  ).slice(0, 5) // Limit to 5 suggestions
}

// Format section validation error for display
export function formatValidationError(validation: ValidationResult): string {
  if (validation.isValid) {
    return ""
  }

  return validation.message || "Invalid section format"
}

// Check if section belongs to a specific batch
export function isSectionInBatch(section: string, batch: number): boolean {
  const parsed = parseSectionString(section)
  return parsed ? parsed.batch === batch : false
}

// Get section validation rules for frontend display
export function getSectionValidationRules(): {
  format: string
  examples: string[]
  rules: string[]
} {
  return {
    format: "{batch}_{section_letter}",
    examples: ["63_G", "64_A", "65_B"],
    rules: [
      "Batch number must be between 50 and 99",
      "Section letter must be uppercase (A-Z)",
      "Format: {batch}_{section_letter}",
      "Example: 63_G for Batch 63, Section G"
    ]
  }
}
