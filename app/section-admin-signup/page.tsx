import { Metadata } from "next"
import { SectionAdminSignup } from "@/components/auth/section-admin-signup"

export const metadata: Metadata = {
  title: "Section Admin Signup | DIU Learning Platform",
  description: "Create your section administrator account to manage academic content and monitor student performance.",
  keywords: ["section admin", "signup", "registration", "DIU", "learning platform", "academic management"],
}

export default function SectionAdminSignupPage() {
  return <SectionAdminSignup />
}
