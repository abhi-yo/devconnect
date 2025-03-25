"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Github, Code, Users, MessageSquare, Bell, Compass, Heart, Lock, ArrowRight, CheckCircle } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { RainbowButton } from "@/components/ui/rainbow-button"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { GridBackground } from "@/components/ui/grid-background"
import { Spotlight } from "@/components/ui/spotlight"
import { Badge } from "@/components/ui/badge"
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll"
import { AtSign } from "lucide-react"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Hero } from "@/app/components/ui/hero"
import { motion } from "framer-motion"
import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { ElegantShape } from "@/components/ui/elegant-shape"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { ShinyButton } from "@/components/ui/shiny-button"

// Feature Card Component
function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ComponentType<{ className?: string }>, 
  title: string, 
  description: string 
}) {
  return (
    <div className="relative rounded-[1.25rem] border border-zinc-800/50 p-2 backdrop-blur-sm">
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 md:p-8 hover:bg-zinc-900/80 transition-colors duration-200">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-space-grotesk text-lg md:text-xl font-semibold tracking-tight text-zinc-100">
              {title}
            </h3>
            <p className="text-sm md:text-[15px] leading-relaxed text-zinc-400">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Pricing Feature Component
function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <CheckCircle className="h-5 w-5 text-white mr-2 flex-shrink-0 mt-0.5" />
      <span className="text-zinc-300">{children}</span>
    </li>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/')
    }
  }, [status, router])

  if (status === "loading") return null

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Geometric Shapes Background - Desktop only */}
          <div className="absolute inset-0 overflow-hidden z-10 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.05] via-transparent to-rose-900/[0.03] blur-3xl" />
            {/* Red-toned shapes */}
            <ElegantShape
              delay={0.3}
              width={550}
              height={120}
              rotate={12}
              gradient="from-rose-500/[0.08]"
              className="left-[-10%] top-[15%] opacity-60"
            />
            <ElegantShape
              delay={0.5}
              width={450}
              height={100}
              rotate={-15}
              gradient="from-rose-600/[0.08]"
              className="right-[-10%] bottom-[10%] opacity-60"
            />
          </div>

          {/* Gradient Effect - Enhanced rose tones - Desktop only */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-center z-0 hidden sm:flex">
            {/* Rose glow */}
            <div className="absolute h-32 w-[24rem] -translate-y-[30%] rounded-full bg-rose-500/15 opacity-70 blur-3xl" />
          </div>

          {/* Mobile-specific background - simpler alternative */}
          <div className="absolute inset-0 sm:hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 to-zinc-950 opacity-50" />
                </div>

          {/* Content - Red accents */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-6 md:mb-8">
                <ShinyButton>
                  <span className="flex items-center space-x-3 text-[13px] font-[350]">
                    <span>Early Access Now Available</span>
                    <span className="h-3 w-[1px] bg-zinc-700/50" />
                    <span>Limited Spots</span>
                  </span>
                </ShinyButton>
              </div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] md:leading-[1.1] font-bold tracking-[-0.02em] mb-5 md:mb-6"
              >
                <span className="text-white">
                  Where Developers
                </span>
                <span className="text-rose-500 block mt-1 md:mt-2">
                  Connect & Collaborate
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-inter text-sm sm:text-base md:text-lg text-zinc-400 mb-8 md:mb-10 max-w-md mx-auto font-[350] leading-relaxed"
              >
                Join a thriving community where passionate developers share ideas,
                collaborate on projects, and build the future together.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-10 md:mb-16"
              >
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button 
                    className="h-10 sm:h-11 text-[13px] sm:text-[14px] font-[450] px-5 sm:px-6 w-full sm:w-[140px] bg-white text-zinc-950 hover:bg-zinc-200 transition-colors duration-200"
                  >
                    Get Started
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="h-10 sm:h-11 px-5 sm:px-6 text-[13px] sm:text-[14px] font-[450] border-zinc-800/70 hover:bg-rose-950/20 hover:border-rose-500/30 transition-all duration-200 w-full sm:w-[140px] backdrop-blur-sm"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="border-t border-zinc-800/50 flex flex-col items-center pt-8 md:pt-10">
              <p className="text-sm text-zinc-500 mb-8 md:mb-10 font-[350]">Trusted by developers from</p>
              <div className="flex items-center justify-center w-full">
                <AnimatedTooltip items={[
                  {
                    id: 1,
                    name: "John Doe",
                    designation: "Software Engineer",
                    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=3387&q=80",
                  },
                  {
                    id: 2,
                    name: "Robert Johnson",
                    designation: "Product Manager",
                    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
                  },
                  {
                    id: 3,
                    name: "Jane Smith",
                    designation: "Data Scientist",
                    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
                  },
                  {
                    id: 4,
                    name: "Emily Davis",
                    designation: "UX Designer",
                    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
                  },
                  {
                    id: 5,
                    name: "Tyler Durden",
                    designation: "Full Stack Developer",
                    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=3540&q=80",
                  }
                ]} />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <DotPattern
            className="[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)] opacity-[0.03]"
            width={32}
            height={32}
            cx={0.5}
            cy={0.5}
            cr={0.5}
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">
                Built for Developers, by Developers
              </h2>
              <p className="font-inter text-zinc-400">
                Everything you need to connect with the developer community and showcase your work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 mt-20">
              {/* Large Feature Card - Social Interactions */}
              <div className="md:col-span-2 relative group rounded-3xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-8 hover:border-rose-500/20 transition duration-300">
                <GlowingEffect spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <div className="flex flex-col h-full">
                  <div className="rounded-2xl bg-rose-500/10 w-12 h-12 flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-rose-500">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-3">Social Interactions</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">Connect with fellow developers, share experiences, and build meaningful relationships within the community. Like, comment, and follow other developers to stay updated with their journey.</p>
                </div>
              </div>

              {/* Profile Management Card */}
              <div className="relative group rounded-3xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-8 hover:border-rose-500/20 transition duration-300">
                <GlowingEffect spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <div className="flex flex-col h-full">
                  <div className="rounded-2xl bg-rose-500/10 w-12 h-12 flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-rose-500">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-3">Profile Management</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">Showcase your skills, projects, and expertise with a customizable developer profile.</p>
                </div>
              </div>

              {/* Code Snippets Card */}
              <div className="relative group rounded-3xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-8 hover:border-rose-500/20 transition duration-300">
                <GlowingEffect spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <div className="flex flex-col h-full">
                  <div className="rounded-2xl bg-rose-500/10 w-12 h-12 flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-rose-500">
                      <path fillRule="evenodd" d="M14.447 3.027a.75.75 0 01.527.92l-4.5 16.5a.75.75 0 01-1.448-.394l4.5-16.5a.75.75 0 01.921-.526zM16.72 6.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L21.44 12l-4.72-4.72a.75.75 0 010-1.06zm-9.44 0a.75.75 0 010 1.06L2.56 12l4.72 4.72a.75.75 0 11-1.06 1.06L.97 12.53a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-3">Share Code Snippets</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">Share and discuss code with syntax highlighting and collaborative comments.</p>
                </div>
              </div>

              {/* Community Projects Card */}
              <div className="md:col-span-2 relative group rounded-3xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-8 hover:border-rose-500/20 transition duration-300">
                <GlowingEffect spread={80} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <div className="flex flex-col h-full">
                  <div className="rounded-2xl bg-rose-500/10 w-12 h-12 flex items-center justify-center mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-rose-500">
                      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-3">Community Projects</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">Collaborate on exciting open-source projects, join hackathons, and build together with developers who share your passion. Find teammates and turn your ideas into reality.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                  What Developers Are Saying
                </h2>
                <p className="font-inter text-zinc-400">
                  Join thousands of developers who have transformed their networking experience
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 mr-4"></div>
                    <div>
                      <h4 className="font-space-grotesk font-semibold text-zinc-100">Sarah Chen</h4>
                      <p className="text-sm text-zinc-400">Frontend Developer</p>
                    </div>
                  </div>
                  <p className="text-zinc-300">
                    "DevConnect has completely changed how I network with other developers. I've found collaborators for
                    three projects in just my first month!"
                  </p>
                  <div className="flex mt-4">
                    <span className="text-rose-400">★★★★★</span>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 mr-4"></div>
                    <div>
                      <h4 className="font-space-grotesk font-semibold text-zinc-100">Marcus Johnson</h4>
                      <p className="text-sm text-zinc-400">Full Stack Developer</p>
                    </div>
                  </div>
                  <p className="text-zinc-300">
                    "The code sharing feature is incredible. I've received valuable feedback on my projects and improved
                    my skills significantly."
                  </p>
                  <div className="flex mt-4">
                    <span className="text-rose-400">★★★★★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <DotPattern
            className="[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)] opacity-[0.025]"
            width={32}
            height={32}
            cx={0.5}
            cy={0.5}
            cr={0.5}
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">Powered by Modern Technology</h2>
              <p className="font-inter text-zinc-400">
                Built with the latest tools and frameworks for optimal performance.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
              <TechCard key="tech-nextjs" name="Next.js" />
              <TechCard key="tech-typescript" name="TypeScript" />
              <TechCard key="tech-prisma" name="Prisma" />
              <TechCard key="tech-tailwind" name="Tailwind CSS" />
              <TechCard key="tech-react" name="React" />
              <TechCard key="tech-vercel" name="Vercel" />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <DotPattern
            className="[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)] opacity-[0.03]"
            width={32}
            height={32}
            cx={0.5}
            cy={0.5}
            cr={0.5}
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </h2>
              <p className="font-inter text-zinc-400">Choose the plan that's right for you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 flex flex-col backdrop-blur-sm">
                <h3 className="font-space-grotesk text-xl font-bold mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <p className="text-zinc-400 mb-6">Perfect for getting started and exploring the platform.</p>

                <ul className="space-y-3 mb-8">
                  <PricingFeature key="free-feature-1">Basic profile customization</PricingFeature>
                  <PricingFeature key="free-feature-2">Join community discussions</PricingFeature>
                  <PricingFeature key="free-feature-3">Limited code snippet sharing</PricingFeature>
                  <PricingFeature key="free-feature-4">Basic GitHub integration</PricingFeature>
                </ul>

                <Link href="/auth/signup">
                  <Button variant="outline" className="mt-auto w-full">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-zinc-900/50 border-2 border-rose-500/50 rounded-xl p-6 flex flex-col relative backdrop-blur-sm">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <h3 className="font-space-grotesk text-xl font-bold mb-2">Pro</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$9</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <p className="text-zinc-400 mb-6">Everything you need for serious networking and collaboration.</p>

                <ul className="space-y-3 mb-8">
                  <PricingFeature key="pro-feature-1">Advanced profile customization</PricingFeature>
                  <PricingFeature key="pro-feature-2">Unlimited code snippet sharing</PricingFeature>
                  <PricingFeature key="pro-feature-3">Real-time chat with developers</PricingFeature>
                  <PricingFeature key="pro-feature-4">Full GitHub integration</PricingFeature>
                  <PricingFeature key="pro-feature-5">Priority support</PricingFeature>
                </ul>

                <RainbowButton className="mt-auto">
                  Get Pro <ArrowRight className="ml-2 h-4 w-4" />
                </RainbowButton>
              </div>

              {/* Team Plan */}
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 flex flex-col backdrop-blur-sm">
                <h3 className="font-space-grotesk text-xl font-bold mb-2">Team</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <p className="text-zinc-400 mb-6">Perfect for teams working together on projects.</p>

                <ul className="space-y-3 mb-8">
                  <PricingFeature key="team-feature-1">Everything in Pro</PricingFeature>
                  <PricingFeature key="team-feature-2">Team collaboration tools</PricingFeature>
                  <PricingFeature key="team-feature-3">Team project management</PricingFeature>
                  <PricingFeature key="team-feature-4">Advanced analytics</PricingFeature>
                  <PricingFeature key="team-feature-5">Dedicated support</PricingFeature>
                </ul>

                <Button variant="outline" className="mt-auto">
                  Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <DotPattern
            className="[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)] opacity-[0.025]"
            width={32}
            height={32}
            cx={0.5}
            cy={0.5}
            cr={0.5}
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">
                Ready to Connect with Developers?
              </h2>
              <p className="font-inter text-zinc-400 mb-8 max-w-xl mx-auto">
                Join thousands of developers already on DevConnect and start collaborating today. No credit card required
                to get started.
              </p>
              <Link href="/auth/signup">
                <RainbowButton className="h-12 text-base">Sign Up Now</RainbowButton>
              </Link>
              <p className="mt-4 text-sm text-zinc-500">Free plan available. No credit card required.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t border-zinc-800/50 bg-zinc-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-16 sm:gap-x-10 lg:gap-x-24 gap-y-10 mb-12 w-full max-w-3xl mx-auto place-items-center text-center">
              <div className="space-y-4">
                <h4 className="font-space-grotesk text-base font-semibold">DevConnect</h4>
                <ul className="space-y-3">
                  <li key="footer-devconnect-1">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li key="footer-devconnect-2">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Features
                    </a>
                  </li>
                  <li key="footer-devconnect-3">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li key="footer-devconnect-4">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-space-grotesk text-base font-semibold">Resources</h4>
                <ul className="space-y-3">
                  <li key="footer-resources-1">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li key="footer-resources-2">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li key="footer-resources-3">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Community
                    </a>
                  </li>
                  <li key="footer-resources-4">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Support
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-space-grotesk text-base font-semibold">Legal</h4>
                <ul className="space-y-3">
                  <li key="footer-legal-1">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Terms
                    </a>
                  </li>
                  <li key="footer-legal-2">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li key="footer-legal-3">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Cookies
                    </a>
                  </li>
                  <li key="footer-legal-4">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Licenses
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-space-grotesk text-base font-semibold">Connect</h4>
                <ul className="space-y-3">
                  <li key="footer-connect-1">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Twitter
                    </a>
                  </li>
                  <li key="footer-connect-2">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      GitHub
                    </a>
                  </li>
                  <li key="footer-connect-3">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Discord
                    </a>
                  </li>
                  <li key="footer-connect-4">
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row justify-between items-center w-full max-w-3xl">
              <div>
                <span className="font-space-grotesk text-lg font-[450]">DevConnect</span>
              </div>
              <div className="mt-6 md:mt-0 text-sm text-zinc-400">
                &copy; {new Date().getFullYear()} DevConnect. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  )
}

function TechCard({ name }: { name: string }) {
  return (
    <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50 flex items-center justify-center backdrop-blur-sm hover:border-rose-500/30 transition-colors duration-200">
      <span className="font-space-grotesk font-medium text-zinc-100 text-sm md:text-base">{name}</span>
    </div>
  )
} 