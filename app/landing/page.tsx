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
    <div className="relative rounded-[1.25rem] border border-zinc-800 p-2">
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={3} />
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-black p-8">
        <div className="flex flex-col gap-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-space-grotesk text-xl font-semibold tracking-tight">
              {title}
            </h3>
            <p className="text-[15px] leading-relaxed text-zinc-400">
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
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          {/* Gradient Effect */}
          <div className="absolute top-0 isolate z-0 flex w-screen flex-1 items-start justify-center -translate-x-16">
            {/* Main glow */}
            <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-[-30%] rounded-full bg-primary/60 opacity-80 blur-3xl" />

            {/* Lamp effect */}
            <motion.div
              initial={{ width: "8rem" }}
              viewport={{ once: true }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
              whileInView={{ width: "16rem" }}
              className="absolute top-0 z-30 h-36 -translate-y-[20%] rounded-full bg-primary/60 blur-2xl"
            />

            {/* Top line */}
            <motion.div
              initial={{ width: "15rem" }}
              viewport={{ once: true }}
              transition={{ ease: "easeInOut", delay: 0.3, duration: 0.8 }}
              whileInView={{ width: "30rem" }}
              className="absolute inset-auto z-50 h-0.5 -translate-y-[-10%] bg-primary/60"
            />

            {/* Left gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              whileInView={{ opacity: 1, width: "30rem" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              }}
              className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-primary/60 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
            >
              <div className="absolute w-[100%] left-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
              <div className="absolute w-40 h-[100%] left-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
            </motion.div>

            {/* Right gradient cone */}
            <motion.div
              initial={{ opacity: 0.5, width: "15rem" }}
              whileInView={{ opacity: 1, width: "30rem" }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              style={{
                backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
              }}
              className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-primary/60 [--conic-position:from_290deg_at_center_top]"
            >
              <div className="absolute w-40 h-[100%] right-0 bg-background bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
              <div className="absolute w-[100%] right-0 bg-background h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
            </motion.div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-800/40 border border-zinc-700/50 text-[13px]">
                  <span className="text-zinc-400 font-[350]">Join 10,000+ developers</span>
                  <div className="w-1 h-1 mx-2 rounded-full bg-zinc-600"></div>
                  <span className="text-zinc-400 font-[350]">⭐ 4.9/5 rating</span>
                </div>
              </div>
              <h1 className="font-space-grotesk text-[3.4rem] leading-[1.1] font-bold tracking-[-0.02em] mb-8">
                Where Developers<br />Connect & Collaborate
              </h1>
              <p className="font-inter text-xl text-zinc-400 mb-12 max-w-2xl mx-auto font-[350] leading-relaxed">
                Join a community of passionate developers to share ideas, collaborate<br />on projects, and grow your network.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
                <Link href="/auth/signup">
                  <RainbowButton className="h-12 text-[15px] font-[450] px-8">Get Started</RainbowButton>
                </Link>
                <Button variant="outline" className="h-12 px-8 text-[15px] font-[450] border-zinc-800">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="border-t border-zinc-800/50 flex flex-col items-center pt-10">
              <p className="text-sm text-zinc-500 mb-10 font-[350]">Trusted by developers from</p>
              <div className="flex flex-wrap justify-center gap-12 opacity-50">
                <div className="w-32 h-5 bg-zinc-800/80 rounded-sm"></div>
                <div className="w-32 h-5 bg-zinc-800/80 rounded-sm"></div>
                <div className="w-32 h-5 bg-zinc-800/80 rounded-sm"></div>
                <div className="w-32 h-5 bg-zinc-800/80 rounded-sm"></div>
                <div className="w-32 h-5 bg-zinc-800/80 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20 bg-black relative overflow-hidden">
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
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">
                Built for Developers, by Developers
              </h2>
              <p className="font-inter text-zinc-400">
                Everything you need to connect with the developer community and showcase your work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={Lock}
                title="Secure Authentication"
                description="Sign up with email or OAuth providers with enhanced security."
              />
              <FeatureCard
                icon={Users}
                title="Profile Management"
                description="Customize your developer profile with bio, skills, and projects."
              />
              <FeatureCard
                icon={Code}
                title="Share Code Snippets"
                description="Share and discuss code with syntax highlighting and comments."
              />
              <FeatureCard
                icon={Heart}
                title="Social Interactions"
                description="Like, comment, and follow other developers in the community."
              />
              <FeatureCard
                icon={MessageSquare}
                title="Real-time Chat"
                description="Connect with developers through instant messaging."
              />
              <FeatureCard
                icon={Compass}
                title="Topic Exploration"
                description="Discover content based on programming topics and interests."
              />
              <FeatureCard
                icon={Bell}
                title="Notifications"
                description="Stay updated with activity related to your posts and profile."
              />
              <FeatureCard
                icon={Github}
                title="GitHub Integration"
                description="Connect your GitHub account to showcase your repositories."
              />
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 bg-black relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">What Developers Are Saying</h2>
                <p className="font-inter text-zinc-400">
                  Join thousands of developers who have transformed their networking experience
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-black border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 mr-4"></div>
                    <div>
                      <h4 className="font-space-grotesk font-semibold">Sarah Chen</h4>
                      <p className="text-sm text-zinc-400">Frontend Developer</p>
                    </div>
                  </div>
                  <p className="text-zinc-300">
                    "DevConnect has completely changed how I network with other developers. I've found collaborators for
                    three projects in just my first month!"
                  </p>
                  <div className="flex mt-4">
                    <span className="text-yellow-500">★★★★★</span>
                  </div>
                </div>

                <div className="bg-black border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 mr-4"></div>
                    <div>
                      <h4 className="font-space-grotesk font-semibold">Marcus Johnson</h4>
                      <p className="text-sm text-zinc-400">Full Stack Developer</p>
                    </div>
                  </div>
                  <p className="text-zinc-300">
                    "The code sharing feature is incredible. I've received valuable feedback on my projects and improved
                    my skills significantly."
                  </p>
                  <div className="flex mt-4">
                    <span className="text-yellow-500">★★★★★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-20 relative overflow-hidden">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
              <TechCard name="Next.js" />
              <TechCard name="TypeScript" />
              <TechCard name="Prisma" />
              <TechCard name="Tailwind CSS" />
              <TechCard name="React" />
              <TechCard name="Vercel" />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-black relative overflow-hidden">
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
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="font-inter text-zinc-400">Choose the plan that's right for you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="bg-black border border-zinc-800 rounded-xl p-6 flex flex-col">
                <h3 className="font-space-grotesk text-xl font-bold mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <p className="text-zinc-400 mb-6">Perfect for getting started and exploring the platform.</p>

                <ul className="space-y-3 mb-8">
                  <PricingFeature>Basic profile customization</PricingFeature>
                  <PricingFeature>Join community discussions</PricingFeature>
                  <PricingFeature>Limited code snippet sharing</PricingFeature>
                  <PricingFeature>Basic GitHub integration</PricingFeature>
                </ul>

                <Link href="/auth/signup">
                  <Button variant="outline" className="mt-auto w-full">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-black border-2 border-white rounded-xl p-6 flex flex-col relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <h3 className="font-space-grotesk text-xl font-bold mb-2">Pro</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$9</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <p className="text-zinc-400 mb-6">Everything you need for serious networking and collaboration.</p>

                <ul className="space-y-3 mb-8">
                  <PricingFeature>Advanced profile customization</PricingFeature>
                  <PricingFeature>Unlimited code snippet sharing</PricingFeature>
                  <PricingFeature>Real-time chat with developers</PricingFeature>
                  <PricingFeature>Full GitHub integration</PricingFeature>
                  <PricingFeature>Priority support</PricingFeature>
                </ul>

                <RainbowButton className="mt-auto">
                  Get Pro <ArrowRight className="ml-2 h-4 w-4" />
                </RainbowButton>
              </div>

              {/* Team Plan */}
              <div className="bg-black border border-zinc-800 rounded-xl p-6 flex flex-col">
                <h3 className="font-space-grotesk text-xl font-bold mb-2">Team</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <p className="text-zinc-400 mb-6">Perfect for teams working together on projects.</p>

                <ul className="space-y-3 mb-8">
                  <PricingFeature>Everything in Pro</PricingFeature>
                  <PricingFeature>Team collaboration tools</PricingFeature>
                  <PricingFeature>Team project management</PricingFeature>
                  <PricingFeature>Advanced analytics</PricingFeature>
                  <PricingFeature>Dedicated support</PricingFeature>
                </ul>

                <Button variant="outline" className="mt-auto">
                  Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black relative overflow-hidden">
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
        <footer className="py-16 border-t border-zinc-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-16 sm:gap-x-10 lg:gap-x-24 gap-y-10 mb-12 w-full max-w-3xl mx-auto place-items-center text-center">
              <div className="space-y-4">
                <h4 className="font-space-grotesk text-base font-semibold">DevConnect</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-space-grotesk text-base font-semibold">Resources</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Community
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Support
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-space-grotesk text-base font-semibold">Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Cookies
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Licenses
                    </a>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-space-grotesk text-base font-semibold">Connect</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                      Discord
                    </a>
                  </li>
                  <li>
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
    <div className="bg-black p-4 rounded-lg border border-zinc-800 flex items-center justify-center">
      <span className="font-space-grotesk font-medium">{name}</span>
    </div>
  )
} 