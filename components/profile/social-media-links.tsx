"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Github,
  ExternalLink,
  Plus,
  X,
  Check
} from "lucide-react"

interface SocialMediaLinksProps {
  websiteUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  githubUrl?: string
  onUpdate: (links: {
    website_url?: string
    linkedin_url?: string
    twitter_url?: string
    facebook_url?: string
    instagram_url?: string
    github_url?: string
  }) => void
  className?: string
}

interface SocialLink {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  placeholder: string
  prefix?: string
  validation?: RegExp
}

const socialLinks: SocialLink[] = [
  {
    key: "website_url",
    label: "Website",
    icon: Globe,
    placeholder: "https://yourwebsite.com",
    validation: /^https?:\/\/[^\s/$.?#].[^\s]*$/
  },
  {
    key: "linkedin_url",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/in/username",
    prefix: "https://linkedin.com/in/",
    validation: /^https?:\/\/(www\.)?linkedin\.com\/.*$/
  },
  {
    key: "twitter_url",
    label: "Twitter/X",
    icon: Twitter,
    placeholder: "https://twitter.com/username",
    prefix: "https://twitter.com/",
    validation: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.*$/
  },
  {
    key: "facebook_url",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://facebook.com/username",
    prefix: "https://facebook.com/",
    validation: /^https?:\/\/(www\.)?facebook\.com\/.*$/
  },
  {
    key: "instagram_url",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/username",
    prefix: "https://instagram.com/",
    validation: /^https?:\/\/(www\.)?instagram\.com\/.*$/
  },
  {
    key: "github_url",
    label: "GitHub",
    icon: Github,
    placeholder: "https://github.com/username",
    prefix: "https://github.com/",
    validation: /^https?:\/\/(www\.)?github\.com\/.*$/
  }
]

export function SocialMediaLinks({
  websiteUrl = "",
  linkedinUrl = "",
  twitterUrl = "",
  facebookUrl = "",
  instagramUrl = "",
  githubUrl = "",
  onUpdate,
  className = ""
}: SocialMediaLinksProps) {
  const [links, setLinks] = useState({
    website_url: websiteUrl,
    linkedin_url: linkedinUrl,
    twitter_url: twitterUrl,
    facebook_url: facebookUrl,
    instagram_url: instagramUrl,
    github_url: githubUrl
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const handleLinkChange = (key: string, value: string) => {
    setLinks(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)

    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }))
    }
  }

  const validateLink = (link: SocialLink, value: string): string => {
    if (!value) return "" // Empty is valid

    if (link.validation && !link.validation.test(value)) {
      return `Please enter a valid ${link.label} URL`
    }

    return ""
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}

    // Validate all links
    socialLinks.forEach(link => {
      const value = links[link.key as keyof typeof links]
      const error = validateLink(link, value)
      if (error) {
        newErrors[link.key] = error
      }
    })

    setErrors(newErrors)

    // If no errors, save the changes
    if (Object.keys(newErrors).length === 0) {
      onUpdate(links)
      setHasChanges(false)
    }
  }

  const handleReset = () => {
    setLinks({
      website_url: websiteUrl,
      linkedin_url: linkedinUrl,
      twitter_url: twitterUrl,
      facebook_url: facebookUrl,
      instagram_url: instagramUrl,
      github_url: githubUrl
    })
    setErrors({})
    setHasChanges(false)
  }

  const openLink = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Social Media & Links
        </CardTitle>
        <CardDescription>
          Add your social media profiles and website links
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {socialLinks.map((link) => {
          const Icon = link.icon
          const value = links[link.key as keyof typeof links]
          const error = errors[link.key]

          return (
            <div key={link.key} className="space-y-2">
              <Label htmlFor={link.key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {link.label}
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id={link.key}
                    type="url"
                    placeholder={link.placeholder}
                    value={value}
                    onChange={(e) => handleLinkChange(link.key, e.target.value)}
                    className={error ? "border-red-500" : ""}
                  />
                  {error && (
                    <p className="text-sm text-red-500 mt-1">{error}</p>
                  )}
                </div>
                {value && !error && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openLink(value)}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}

        {hasChanges && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Save Links
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
