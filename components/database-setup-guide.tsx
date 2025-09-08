"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  ArrowRight
} from "lucide-react"

interface DatabaseSetupGuideProps {
  onRetry?: () => void
}

export function DatabaseSetupGuide({ onRetry }: DatabaseSetupGuideProps) {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- Create student_users table for batch-based user authentication
CREATE TABLE IF NOT EXISTS "public"."student_users" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar(255) UNIQUE NOT NULL,
    "email" varchar(255) UNIQUE NOT NULL,
    "full_name" varchar(255),
    "batch" varchar(10),
    "section" varchar(10),
    "section_id" uuid,
    "has_skipped_selection" boolean DEFAULT false,
    "profile_photo_url" text,
    "phone" varchar(20),
    "student_id" varchar(50),
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "last_accessed" timestamp with time zone DEFAULT now(),
    "is_active" boolean DEFAULT true,
    CONSTRAINT "student_users_pkey" PRIMARY KEY ("id")
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS "idx_student_users_user_id" ON "public"."student_users" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_student_users_email" ON "public"."student_users" ("email");
CREATE INDEX IF NOT EXISTS "idx_student_users_batch" ON "public"."student_users" ("batch");
CREATE INDEX IF NOT EXISTS "idx_student_users_section_id" ON "public"."student_users" ("section_id");

-- Enable RLS
ALTER TABLE "public"."student_users" ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public access
DROP POLICY IF EXISTS "Allow public access to student_users" ON "public"."student_users";
CREATE POLICY "Allow public access to student_users" ON "public"."student_users"
    FOR ALL USING (true);`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/bpfsnwfaxmhtsdjcjeju/sql', '_blank')
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-700">
            Database Setup Required
          </CardTitle>
          <CardDescription className="text-base">
            The student_users table needs to be created in your Supabase database before you can use the section selection feature.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Alert */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              This is a one-time setup. Once completed, all users will be able to select their sections and manage their profiles.
            </AlertDescription>
          </Alert>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Setup Steps:</h3>
            
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-2">Open Supabase SQL Editor</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Click the button below to open your Supabase dashboard SQL editor in a new tab.
                </p>
                <Button onClick={openSupabaseDashboard} variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Supabase Dashboard
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-2">Copy and Run SQL Script</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Copy the SQL script below and paste it into the SQL editor, then click "Run".
                </p>
                
                {/* SQL Script */}
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                    <code>{sqlScript}</code>
                  </pre>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy SQL
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-2">Test the Setup</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  After running the SQL script, click the button below to test if the setup was successful.
                </p>
                <Button onClick={onRetry} variant="default" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Setup
                </Button>
              </div>
            </div>
          </div>

          {/* Features Info */}
          <div className="bg-muted/50 border rounded-lg p-4">
            <h4 className="font-medium mb-2">What this enables:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-green-500"></Badge>
                Email-based user authentication
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-green-500"></Badge>
                Batch and section selection
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-green-500"></Badge>
                User profile management
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-green-500"></Badge>
                Skip functionality for guests
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help? Check the setup-database.md file for detailed instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
