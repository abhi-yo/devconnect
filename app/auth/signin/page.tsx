import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import SignInForm from "@/components/auth/signin-form"
import AuthLayout from "@/components/layouts/auth-layout"

export default async function SignIn() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  )
}

