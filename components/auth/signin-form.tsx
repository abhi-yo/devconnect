"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Github, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

const signInSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password is too long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      }
    ),
})

type SignInFormValues = z.infer<typeof signInSchema>

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "Too many attempts. Please try again later.") {
          toast({
            title: "Rate Limited",
            description: "Too many attempts. Please try again later.",
            variant: "destructive",
          })
        } else {
          setError("Invalid email or password")
          setFormError("email", { message: "Invalid email or password" })
          setFormError("password", { message: "Invalid email or password" })
        }
        return
      }

      toast({
        title: "Success",
        description: "Successfully signed in",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign in error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await signIn("github", { 
        callbackUrl: "/",
        redirect: true,
      })
    } catch (error) {
      console.error("GitHub sign in error:", error)
      toast({
        title: "Error",
        description: "Failed to sign in with GitHub. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-heading font-bold tracking-tight">Welcome back</h1>
        <p className="text-[15px] font-normal text-muted-foreground">Enter your credentials to continue</p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] font-medium leading-none">
            Email
          </Label>
          <Input 
            id="email" 
            type="email"
            autoComplete="email"
            placeholder="name@example.com" 
            {...register("email")} 
            disabled={isLoading}
            className="h-11 text-[15px] font-normal"
          />
          {errors.email && (
            <p className="text-[13px] text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px] font-medium leading-none">
              Password
            </Label>
            <Link 
              href="/auth/forgot-password" 
              className="text-[13px] font-medium text-primary hover:text-primary/90 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input 
            id="password" 
            type="password"
            autoComplete="current-password"
            {...register("password")} 
            disabled={isLoading}
            className="h-11 text-[15px] font-normal"
          />
          {errors.password && (
            <p className="text-[13px] text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 text-[15px] font-medium" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-[13px] font-medium text-muted-foreground uppercase">
            or continue with
          </span>
        </div>
      </div>

      <Button 
        variant="outline" 
        type="button" 
        className="w-full h-11 text-[15px] font-medium" 
        onClick={handleGithubSignIn} 
        disabled={isLoading}
      >
        <Github className="mr-2 h-5 w-5" />
        GitHub
      </Button>

      <p className="text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link 
          href="/auth/signup" 
          className="font-medium text-primary hover:text-primary/90 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

