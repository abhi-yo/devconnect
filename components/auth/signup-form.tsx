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

const signUpSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name is too long" })
    .regex(/^[a-zA-Z\s]*$/, { message: "Name can only contain letters and spaces" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username is too long" })
    .regex(/^[a-zA-Z0-9_]+$/, { 
      message: "Username can only contain letters, numbers, and underscores" 
    }),
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Please enter a valid email address" }),
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

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      let result
      try {
        const text = await response.text()
        result = text ? JSON.parse(text) : {}
      } catch (e) {
        console.error("Failed to parse response:", e)
        throw new Error("Server response was not valid JSON")
      }

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Too many attempts. Please try again later.",
            variant: "destructive",
          })
          return
        }

        if (response.status === 409) {
          if (result.message?.includes("email")) {
            setError("Email already exists")
            setFormError("email", { message: "Email already exists" })
          } else if (result.message?.includes("username")) {
            setError("Username is already taken")
            setFormError("username", { message: "Username is already taken" })
          }
          return
        }

        throw new Error(result.message || "Failed to register")
      }

      toast({
        title: "Success",
        description: "Account created! Please check your email to verify your account before signing in.",
      })

      router.push("/auth/signin?verified=false")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignUp = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await signIn("github", { 
        callbackUrl: "/onboarding",
        redirect: true,
      })
    } catch (error) {
      console.error("GitHub sign up error:", error)
      toast({
        title: "Error",
        description: "Failed to sign up with GitHub. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-heading font-bold tracking-tight">Create an account</h1>
        <p className="text-[15px] font-normal text-muted-foreground">Enter your information to get started</p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[13px] font-medium leading-none">Name</Label>
          <Input 
            id="name" 
            type="text"
            autoComplete="name"
            placeholder="John Doe" 
            {...register("name")} 
            disabled={isLoading} 
            className="h-11 text-[15px] font-normal"
          />
          {errors.name && (
            <p className="text-[13px] text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-[13px] font-medium leading-none">Username</Label>
          <Input 
            id="username" 
            type="text"
            autoComplete="username"
            placeholder="johndoe" 
            {...register("username")} 
            disabled={isLoading} 
            className="h-11 text-[15px] font-normal"
          />
          {errors.username && (
            <p className="text-[13px] text-destructive mt-1">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] font-medium leading-none">Email</Label>
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
          <Label htmlFor="password" className="text-[13px] font-medium leading-none">Password</Label>
          <Input 
            id="password" 
            type="password"
            autoComplete="new-password"
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
              Creating account...
            </>
          ) : (
            "Sign up"
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
        type="button" 
        onClick={handleGithubSignUp}
        disabled={isLoading}
        className="w-full h-11 space-x-2 bg-black hover:bg-black/90"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Github className="h-4 w-4" />
        )}
        <span>Continue with GitHub</span>
      </Button>

      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link 
          href="/auth/signin" 
          className="font-medium text-primary hover:text-primary/90 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}

