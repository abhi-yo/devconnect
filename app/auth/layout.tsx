import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "DevConnect - Authentication",
  description: "Sign in or sign up to DevConnect",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
} 