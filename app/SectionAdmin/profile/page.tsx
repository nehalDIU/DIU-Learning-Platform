"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload"
import { SocialMediaLinks } from "@/components/profile/social-media-links"
import { 
  User, 
  Save,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Heart,
  GraduationCap,
  Languages,
  Award,
  Clock,
  Users,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

export default function SectionAdminProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profile, setProfile] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    bio: "",
    profilePhotoUrl: null as string | null,
    address: "",
    dateOfBirth: "",
    websiteUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    githubUrl: "",

    specializations: [] as string[],
    languagesSpoken: [] as string[],
    educationBackground: [] as any[],
    certifications: [] as any[],
    createdAt: "",
  })

  // Load profile data on component mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true)
      const response = await fetch("/api/profile")
      const result = await response.json()

      if (result.success && result.profile) {
        const profileData = result.profile
        setProfile({
          id: profileData.id,
          fullName: profileData.full_name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          department: profileData.department || "",
          role: profileData.role || "",
          bio: profileData.bio || "",
          profilePhotoUrl: profileData.profile_photo_url,
          address: profileData.address || "",
          dateOfBirth: profileData.date_of_birth || "",
          websiteUrl: profileData.website_url || "",
          linkedinUrl: profileData.linkedin_url || "",
          twitterUrl: profileData.twitter_url || "",
          facebookUrl: profileData.facebook_url || "",
          instagramUrl: profileData.instagram_url || "",
          githubUrl: profileData.github_url || "",

          specializations: profileData.specializations || [],
          languagesSpoken: profileData.languages_spoken || [],
          educationBackground: profileData.education_background || [],
          certifications: profileData.certifications || [],
          createdAt: profileData.created_at || "",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Failed to load profile data")
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const updateData = {
        full_name: profile.fullName,
        phone: profile.phone,
        bio: profile.bio,
        address: profile.address,
        date_of_birth: profile.dateOfBirth || null,
        website_url: profile.websiteUrl,
        linkedin_url: profile.linkedinUrl,
        twitter_url: profile.twitterUrl,
        facebook_url: profile.facebookUrl,
        instagram_url: profile.instagramUrl,
        github_url: profile.githubUrl,

        specializations: profile.specializations,
        languages_spoken: profile.languagesSpoken,
        education_background: profile.educationBackground,
        certifications: profile.certifications,
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Profile updated successfully!")
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    loadProfile()
    toast.info("Profile reset to saved values")
  }

  const handlePhotoUpdate = (newPhotoUrl: string | null) => {
    setProfile(prev => ({ ...prev, profilePhotoUrl: newPhotoUrl }))
  }

  const handleSocialMediaUpdate = (links: any) => {
    setProfile(prev => ({
      ...prev,
      websiteUrl: links.website_url || "",
      linkedinUrl: links.linkedin_url || "",
      twitterUrl: links.twitter_url || "",
      facebookUrl: links.facebook_url || "",
      instagramUrl: links.instagram_url || "",
      githubUrl: links.github_url || "",
    }))
    
    // Auto-save social media links
    handleSave()
  }

  const addSpecialization = () => {
    setProfile(prev => ({
      ...prev,
      specializations: [...prev.specializations, ""]
    }))
  }

  const updateSpecialization = (index: number, value: string) => {
    setProfile(prev => ({
      ...prev,
      specializations: prev.specializations.map((spec, i) => i === index ? value : spec)
    }))
  }

  const removeSpecialization = (index: number) => {
    setProfile(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }))
  }

  const addLanguage = () => {
    setProfile(prev => ({
      ...prev,
      languagesSpoken: [...prev.languagesSpoken, ""]
    }))
  }

  const updateLanguage = (index: number, value: string) => {
    setProfile(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.map((lang, i) => i === index ? value : lang)
    }))
  }

  const removeLanguage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.filter((_, i) => i !== index)
    }))
  }

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Your personal and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <ProfilePhotoUpload
                  currentPhotoUrl={profile.profilePhotoUrl}
                  userName={profile.fullName}
                  onPhotoUpdate={handlePhotoUpdate}
                />
              </div>

              <Separator />

              {/* Personal Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Your address..."
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <SocialMediaLinks
            websiteUrl={profile.websiteUrl}
            linkedinUrl={profile.linkedinUrl}
            twitterUrl={profile.twitterUrl}
            facebookUrl={profile.facebookUrl}
            instagramUrl={profile.instagramUrl}
            githubUrl={profile.githubUrl}
            onUpdate={handleSocialMediaUpdate}
          />

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Your work-related details and office information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.role || "Section Administrator"}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>



              {/* Specializations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Specializations
                  </Label>
                  <Button variant="outline" size="sm" onClick={addSpecialization}>
                    <Users className="h-4 w-4 mr-2" />
                    Add Specialization
                  </Button>
                </div>
                <div className="space-y-2">
                  {profile.specializations.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., Computer Science, Data Analysis"
                        value={spec}
                        onChange={(e) => updateSpecialization(index, e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecialization(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {profile.specializations.length === 0 && (
                    <p className="text-sm text-muted-foreground">No specializations added yet.</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Languages */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Languages Spoken
                  </Label>
                  <Button variant="outline" size="sm" onClick={addLanguage}>
                    <Languages className="h-4 w-4 mr-2" />
                    Add Language
                  </Button>
                </div>
                <div className="space-y-2">
                  {profile.languagesSpoken.map((lang, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., English, Bengali, Hindi"
                        value={lang}
                        onChange={(e) => updateLanguage(index, e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLanguage(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {profile.languagesSpoken.length === 0 && (
                    <p className="text-sm text-muted-foreground">No languages added yet.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  {profile.profilePhotoUrl ? (
                    <img 
                      src={profile.profilePhotoUrl} 
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-xl">
                      {profile.fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{profile.fullName}</p>
                  <p className="text-sm text-muted-foreground">{profile.role || "Section Administrator"}</p>
                  <p className="text-sm text-muted-foreground">{profile.department}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3 w-3" />
                    <span>{profile.phone}</span>
                  </div>
                )}

                {profile.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-center">
                  {profile.role || "Section Administrator"}
                </Badge>
                <Badge variant="outline" className="w-full justify-center">
                  Active Account
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/SectionAdmin/settings">
                  <User className="h-4 w-4 mr-2" />
                  Account Settings
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/SectionAdmin">
                  <Building className="h-4 w-4 mr-2" />
                  Dashboard
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/SectionAdmin/semester-management">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Manage Semesters
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
