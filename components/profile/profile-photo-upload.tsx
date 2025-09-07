"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  User,
  ImageIcon,
  Trash2
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null
  userName: string
  onPhotoUpdate: (newPhotoUrl: string | null) => void
  className?: string
}

export function ProfilePhotoUpload({ 
  currentPhotoUrl, 
  userName, 
  onPhotoUpdate,
  className = ""
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get user initials for fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.")
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("File size too large. Maximum size is 5MB.")
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setIsDialogOpen(true)
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return

    setIsUploading(true)
    try {
      const file = fileInputRef.current.files[0]
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onPhotoUpdate(result.profile_photo_url)
        toast.success("Profile photo uploaded successfully!")
        setIsDialogOpen(false)
        setPreviewUrl(null)
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        toast.error(result.error || "Failed to upload photo")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload photo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentPhotoUrl) return

    setIsDeleting(true)
    try {
      const response = await fetch("/api/profile/photo", {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        onPhotoUpdate(null)
        toast.success("Profile photo removed successfully!")
      } else {
        toast.error(result.error || "Failed to remove photo")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to remove photo")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Current Photo Display */}
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentPhotoUrl || undefined} alt={userName} />
          <AvatarFallback className="text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {getUserInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Upload Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
            >
              <Camera className="h-4 w-4 mr-2" />
              {currentPhotoUrl ? "Change Photo" : "Upload Photo"}
            </Button>

            {currentPhotoUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP or GIF. Max 5MB.
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Profile Photo</DialogTitle>
            <DialogDescription>
              Preview your new profile photo before uploading.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewUrl || undefined} alt="Preview" />
                <AvatarFallback>
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
