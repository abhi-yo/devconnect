import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import SignUpForm from "@/components/auth/signup-form"
import AuthLayout from "@/components/layouts/auth-layout"

export default async function SignUp() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  )
}

