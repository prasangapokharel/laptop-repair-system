import { RegisterForm } from "@/components/register-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up | Laptop Repair Management",
  description: "Create a new account",
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl">
        <RegisterForm />
      </div>
    </main>
  )
}
