"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload"
import { SocialMediaLinks } from "@/components/profile/social-media-links"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Save,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Globe,
  Building,
  Users,
  GraduationCap,
  Languages,
  Award,
  Heart,
  Eye,
  UserCheck
} from "lucide-react"
import { toast } from "sonner"

export default function SectionAdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [settings, setSettings] = useState({
    // Profile Settings
    id: "",
    fullName: "Dr. Sarah Ahmed",
    email: "sarah.ahmed@diu.edu.bd",
    phone: "+880 1234567890",
    department: "CS-A",
    designation: "Section Administrator",
    bio: "Experienced educator with 10+ years in computer science education.",
    profilePhotoUrl: null as string | null,
    address: "",
    dateOfBirth: "",
    websiteUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    githubUrl: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    officeLocation: "",
    officeHours: "",
    specializations: [] as string[],
    languagesSpoken: [] as string[],
    educationBackground: [] as any[],
    certifications: [] as any[],

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    semesterUpdates: true,
    studentActivity: false,

    // Dashboard Preferences
    theme: "system",
    language: "en",
    timezone: "Asia/Dhaka",
    dateFormat: "DD/MM/YYYY",
    defaultView: "dashboard",

    // Privacy Settings
    profileVisibility: "department",
    showEmail: false,
    showPhone: false,
    allowStudentContact: true,
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
        const profile = result.profile
        setSettings(prev => ({
          ...prev,
          id: profile.id,
          fullName: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          department: profile.department || "",
          bio: profile.bio || "",
          profilePhotoUrl: profile.profile_photo_url,
          address: profile.address || "",
          dateOfBirth: profile.date_of_birth || "",
          websiteUrl: profile.website_url || "",
          linkedinUrl: profile.linkedin_url || "",
          twitterUrl: profile.twitter_url || "",
          facebookUrl: profile.facebook_url || "",
          instagramUrl: profile.instagram_url || "",
          githubUrl: profile.github_url || "",
          emergencyContactName: profile.emergency_contact_name || "",
          emergencyContactPhone: profile.emergency_contact_phone || "",
          emergencyContactRelationship: profile.emergency_contact_relationship || "",
          officeLocation: profile.office_location || "",
          officeHours: profile.office_hours || "",
          specializations: profile.specializations || [],
          languagesSpoken: profile.languages_spoken || [],
          educationBackground: profile.education_background || [],
          certifications: profile.certifications || [],
          profileVisibility: profile.profile_visibility || "department",
          showEmail: profile.show_email || false,
          showPhone: profile.show_phone || false,
          allowStudentContact: profile.allow_student_contact !== false,
          // Load notification preferences
          emailNotifications: profile.notification_preferences?.email_notifications !== false,
          pushNotifications: profile.notification_preferences?.push_notifications !== false,
          weeklyReports: profile.notification_preferences?.weekly_reports !== false,
          semesterUpdates: profile.notification_preferences?.semester_updates !== false,
          studentActivity: profile.notification_preferences?.student_activity === true,
        }))
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
        full_name: settings.fullName,
        phone: settings.phone,
        bio: settings.bio,
        address: settings.address,
        date_of_birth: settings.dateOfBirth || null,
        website_url: settings.websiteUrl,
        linkedin_url: settings.linkedinUrl,
        twitter_url: settings.twitterUrl,
        facebook_url: settings.facebookUrl,
        instagram_url: settings.instagramUrl,
        github_url: settings.githubUrl,
        emergency_contact_name: settings.emergencyContactName,
        emergency_contact_phone: settings.emergencyContactPhone,
        emergency_contact_relationship: settings.emergencyContactRelationship,
        office_location: settings.officeLocation,
        office_hours: settings.officeHours,
        specializations: settings.specializations,
        languages_spoken: settings.languagesSpoken,
        education_background: settings.educationBackground,
        certifications: settings.certifications,
        profile_visibility: settings.profileVisibility,
        show_email: settings.showEmail,
        show_phone: settings.showPhone,
        allow_student_contact: settings.allowStudentContact,
        notification_preferences: {
          email_notifications: settings.emailNotifications,
          push_notifications: settings.pushNotifications,
          weekly_reports: settings.weeklyReports,
          semester_updates: settings.semesterUpdates,
          student_activity: settings.studentActivity,
        }
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
        toast.success("Settings saved successfully!")
      } else {
        toast.error(result.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    loadProfile()
    toast.info("Settings reset to saved values")
  }

  const handlePhotoUpdate = (newPhotoUrl: string | null) => {
    setSettings(prev => ({ ...prev, profilePhotoUrl: newPhotoUrl }))
  }

  const handleSocialMediaUpdate = (links: any) => {
    setSettings(prev => ({
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

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account and dashboard preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo Upload */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <ProfilePhotoUpload
                  currentPhotoUrl={settings.profilePhotoUrl}
                  userName={settings.fullName}
                  onPhotoUpdate={handlePhotoUpdate}
                />
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={settings.fullName}
                    onChange={(e) => setSettings(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
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
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={settings.department}
                    onChange={(e) => setSettings(prev => ({ ...prev, department: e.target.value }))}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={settings.dateOfBirth}
                    onChange={(e) => setSettings(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officeLocation">Office Location</Label>
                  <Input
                    id="officeLocation"
                    placeholder="Room 101, Building A"
                    value={settings.officeLocation}
                    onChange={(e) => setSettings(prev => ({ ...prev, officeLocation: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Your address..."
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={settings.bio}
                  onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="officeHours">Office Hours</Label>
                <Textarea
                  id="officeHours"
                  placeholder="e.g., Monday-Friday 9:00 AM - 5:00 PM"
                  value={settings.officeHours}
                  onChange={(e) => setSettings(prev => ({ ...prev, officeHours: e.target.value }))}
                  rows={2}
                />
              </div>

              <Separator />

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Emergency Contact
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      placeholder="Full name"
                      value={settings.emergencyContactName}
                      onChange={(e) => setSettings(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      placeholder="Phone number"
                      value={settings.emergencyContactPhone}
                      onChange={(e) => setSettings(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input
                      id="emergencyContactRelationship"
                      placeholder="e.g., Spouse, Parent"
                      value={settings.emergencyContactRelationship}
                      onChange={(e) => setSettings(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <SocialMediaLinks
            websiteUrl={settings.websiteUrl}
            linkedinUrl={settings.linkedinUrl}
            twitterUrl={settings.twitterUrl}
            facebookUrl={settings.facebookUrl}
            instagramUrl={settings.instagramUrl}
            githubUrl={settings.githubUrl}
            onUpdate={handleSocialMediaUpdate}
          />

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Get weekly summary reports
                  </p>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyReports: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Semester Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about semester changes
                  </p>
                </div>
                <Switch
                  checked={settings.semesterUpdates}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, semesterUpdates: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Student Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about student engagement
                  </p>
                </div>
                <Switch
                  checked={settings.studentActivity}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, studentActivity: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Dashboard Preferences
              </CardTitle>
              <CardDescription>
                Customize your dashboard experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">বাংলা</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default View</Label>
                <Select value={settings.defaultView} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultView: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="semesters">Semesters</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, profileVisibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Everyone can see</SelectItem>
                    <SelectItem value="department">Department - Only department members</SelectItem>
                    <SelectItem value="private">Private - Only you</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your email in public profile
                  </p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showEmail: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Phone Number</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your phone in public profile
                  </p>
                </div>
                <Switch
                  checked={settings.showPhone}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPhone: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Student Contact</Label>
                  <p className="text-sm text-muted-foreground">
                    Students can contact you directly
                  </p>
                </div>
                <Switch
                  checked={settings.allowStudentContact}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowStudentContact: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {settings.profilePhotoUrl ? (
                    <img
                      src={settings.profilePhotoUrl}
                      alt={settings.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                      {settings.fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{settings.fullName}</p>
                  <p className="text-sm text-muted-foreground">{settings.designation || "Section Administrator"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3" />
                  <span>{settings.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3 w-3" />
                  <span>{settings.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3" />
                  <span>Member since Jan 2023</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-center">
                  Section Administrator
                </Badge>
                <Badge variant="outline" className="w-full justify-center">
                  Active Account
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Semesters Managed</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Courses</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Students</span>
                <span className="font-medium">450</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Login</span>
                <span className="font-medium">Today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
