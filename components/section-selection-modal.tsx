"use client"

import React, { useState, useEffect } from "react"
import { GraduationCap, Users, ArrowRight, AlertCircle, CheckCircle, Mail, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSectionContext } from "@/contexts/SectionContext"
import { DatabaseSetupGuide } from "./database-setup-guide"

interface Batch {
  batch: string
  sections: string[]
  sampleTitle: string
  displayName: string
}

interface SectionSelectionModalProps {
  onComplete?: () => void
}

export function SectionSelectionModal({ onComplete }: SectionSelectionModalProps) {
  const { createUserWithEmail, skipSectionSelection, isLoading, error } = useSectionContext()

  // Form state
  const [email, setEmail] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("")
  const [batches, setBatches] = useState<Batch[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  // Fetch available batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch('/api/batches')
        if (response.ok) {
          const batchData = await response.json()
          setBatches(batchData)
        }
      } catch (err) {
        console.error('Error fetching batches:', err)
      }
    }
    fetchBatches()
  }, [])

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!selectedBatch) {
      errors.batch = "Please select your batch"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      await createUserWithEmail({
        email: email.trim(),
        batch: selectedBatch
      })
      setSuccess(true)

      // Call onComplete after a brief delay to show success state
      setTimeout(() => {
        onComplete?.()
      }, 1500)
    } catch (err) {
      console.error('Error creating user:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user account'

      // Check if it's a database setup error
      if (errorMessage.includes('Database setup required') || errorMessage.includes('Database table missing')) {
        setShowSetupGuide(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    try {
      setIsSubmitting(true)
      await skipSectionSelection()
      onComplete?.()
    } catch (err) {
      console.error('Error skipping selection:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to skip selection'

      // Check if it's a database setup error
      if (errorMessage.includes('Database setup required') || errorMessage.includes('Database table missing')) {
        setShowSetupGuide(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedBatchData = batches.find(b => b.batch === selectedBatch)

  // Show database setup guide if needed
  if (showSetupGuide) {
    return (
      <DatabaseSetupGuide
        onRetry={() => {
          setShowSetupGuide(false)
          // Clear any previous errors
          setFormErrors({})
        }}
      />
    )
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Welcome, {fullName}!
            </CardTitle>
            <CardDescription>
              You've successfully joined Batch {selectedBatch} - Section {selectedSection}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting to your dashboard...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to DIU Learning Platform
          </CardTitle>
          <CardDescription className="text-base">
            Enter your email and batch to access your personalized content. Your data will be restored across all devices.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Information Form */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={formErrors.email ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>



            {/* Batch Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Select Your Batch
              </Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch} disabled={isSubmitting}>
                <SelectTrigger className={formErrors.batch ? "border-red-500" : ""}>
                  <SelectValue placeholder="Choose your batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.batch} value={batch.batch}>
                      <div className="flex items-center justify-between w-full">
                        <span>{batch.displayName}</span>
                        <Badge variant="outline" className="ml-2">
                          {batch.sections.length} sections
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.batch && (
                <p className="text-sm text-red-500">{formErrors.batch}</p>
              )}
            </div>


          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!email || !selectedBatch || isSubmitting}
              className="w-full h-12"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Joining your batch...
                </>
              ) : (
                <>
                  Join Batch {selectedBatch}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Skip Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full h-10"
            >
              <X className="mr-2 h-4 w-4" />
              Skip and browse all content
            </Button>
          </div>

          {/* Information */}
          <div className="bg-muted/50 border rounded-lg p-4 mt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                📚 Why provide your email and batch?
              </p>
              <p className="text-sm text-muted-foreground">
                • Get personalized content for your batch
                • Track your progress and access your data anywhere
                • Update your information anytime in your profile
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Your email serves as your unique identifier. Use the same email on any device to access your data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
