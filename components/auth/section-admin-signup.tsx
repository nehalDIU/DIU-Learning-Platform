"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Loader2, UserPlus, Eye, EyeOff, Check, ChevronsUpDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { AVAILABLE_SECTIONS, searchSections, formatSectionForDisplay } from "@/lib/section-data"
import { validateSectionForSignup, getSectionValidationRules } from "@/lib/section-validation"

interface FormData {
  name: string
  email: string
  section: string
  password: string
}

interface FormErrors {
  name?: string
  email?: string
  section?: string
  password?: string
  general?: string
}

export function SectionAdminSignup() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    section: "",
    password: ""
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [sectionSearchOpen, setSectionSearchOpen] = useState(false)
  const [sectionSearchQuery, setSectionSearchQuery] = useState("")
  
  const router = useRouter()

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    return searchSections(sectionSearchQuery)
  }, [sectionSearchQuery])

  // Get validation rules for display
  const validationRules = getSectionValidationRules()

  // Validate individual fields
  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return "Name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        return undefined
        
      case 'email':
        if (!value.trim()) return "Email is required"
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(value)) return "Please enter a valid email address"
        return undefined
        
      case 'section':
        if (!value.trim()) return "Section is required"
        const sectionValidation = validateSectionForSignup(value)
        return sectionValidation.isValid ? undefined : sectionValidation.message
        
      case 'password':
        if (!value) return "Password is required"
        if (value.length < 6) return "Password must be at least 6 characters"
        return undefined
        
      default:
        return undefined
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Handle section selection
  const handleSectionSelect = (sectionValue: string) => {
    handleInputChange('section', sectionValue)
    setSectionSearchOpen(false)
    setSectionSearchQuery("")
  }

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }
    
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/section-admin-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(data.message || "Account created successfully!")
        
        // Redirect to SectionAdmin dashboard
        router.push('/SectionAdmin')
      } else {
        setErrors({ general: data.error || 'Signup failed' })
        toast.error(data.error || 'Signup failed')
      }
    } catch (error) {
      console.error('Signup error:', error)
      const errorMessage = 'Network error. Please try again.'
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Section Admin Signup</CardTitle>
          <CardDescription>
            Create your section administrator account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? "border-red-500" : ""}
                disabled={isLoading}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@diu.edu.bd"
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Section Field */}
            <div className="space-y-2">
              <Label htmlFor="section">Section *</Label>
              <Popover open={sectionSearchOpen} onOpenChange={setSectionSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sectionSearchOpen}
                    className={cn(
                      "w-full justify-between",
                      errors.section && "border-red-500",
                      !formData.section && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {formData.section 
                      ? formatSectionForDisplay(formData.section)
                      : "Select your section..."
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search sections..." 
                      value={sectionSearchQuery}
                      onValueChange={setSectionSearchQuery}
                    />
                    <CommandEmpty>No section found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredSections.map((section) => (
                        <CommandItem
                          key={section.value}
                          value={section.value}
                          onSelect={() => handleSectionSelect(section.value)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.section === section.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {section.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.section && (
                <p className="text-sm text-red-600">{errors.section}</p>
              )}
              
              {/* Section Format Help */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Section Format: {validationRules.format}</p>
                  <p>Examples: {validationRules.examples.join(", ")}</p>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password (min. 6 characters)"
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
          
          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
