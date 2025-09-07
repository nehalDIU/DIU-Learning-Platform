"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  Globe
} from "lucide-react"
import { toast } from "sonner"

export default function SectionAdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Profile Settings
    fullName: "Dr. Sarah Ahmed",
    email: "sarah.ahmed@diu.edu.bd",
    phone: "+880 1234567890",
    department: "CS-A",
    designation: "Section Administrator",
    bio: "Experienced educator with 10+ years in computer science education.",
    
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

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    toast.info("Settings reset to defaults")
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
            <CardContent className="space-y-4">
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={settings.designation}
                  onChange={(e) => setSettings(prev => ({ ...prev, designation: e.target.value }))}
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
            </CardContent>
          </Card>

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
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  SA
                </div>
                <div>
                  <p className="font-medium">{settings.fullName}</p>
                  <p className="text-sm text-muted-foreground">{settings.designation}</p>
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
