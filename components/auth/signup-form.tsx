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
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to register")
      }

      // Sign in the user after successful registration
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      toast({
        title: "Success",
        description: "Your account has been created",
      })

      router.push("/onboarding")
      router.refresh()
    } catch (error) {
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
    setIsLoading(true)
    try {
      await signIn("github", { callbackUrl: "/onboarding" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign up with GitHub",
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[13px] font-medium leading-none">Name</Label>
          <Input 
            id="name" 
            placeholder="John Doe" 
            {...register("name")} 
            disabled={isLoading} 
            className="h-11 text-[15px] font-normal"
          />
          {errors.name && <p className="text-[13px] text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-[13px] font-medium leading-none">Username</Label>
          <Input 
            id="username" 
            placeholder="johndoe" 
            {...register("username")} 
            disabled={isLoading} 
            className="h-11 text-[15px] font-normal"
          />
          {errors.username && <p className="text-[13px] text-destructive mt-1">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] font-medium leading-none">Email</Label>
          <Input 
            id="email" 
            placeholder="name@example.com" 
            {...register("email")} 
            disabled={isLoading} 
            className="h-11 text-[15px] font-normal"
          />
          {errors.email && <p className="text-[13px] text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[13px] font-medium leading-none">Password</Label>
          <Input 
            id="password" 
            type="password" 
            {...register("password")} 
            disabled={isLoading} 
            className="h-11 text-[15px] font-normal"
          />
          {errors.password && <p className="text-[13px] text-destructive mt-1">{errors.password.message}</p>}
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
          <span className="bg-background px-3 text-[13px] font-medium text-muted-foreground uppercase">or continue with</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        type="button" 
        className="w-full h-11 text-[15px] font-medium" 
        onClick={handleGithubSignUp} 
        disabled={isLoading}
      >
        <Github className="mr-2 h-5 w-5" />
        GitHub
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

