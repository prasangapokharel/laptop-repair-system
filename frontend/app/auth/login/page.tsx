import { LoginForm } from "@/components/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In | Laptop Repair Management",
  description: "Sign in to your account",
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl">
        <LoginForm />
      </div>
    </main>
  )
}
