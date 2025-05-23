"use client"

import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Github, Code, Users, MessageSquare, Bell, Compass, Heart, Lock, ArrowRight, CheckCircle, HelpCircle, Home as HomeIcon, Package, DollarSign } from "lucide-react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import Link from "next/link"
import { GridBackground } from "@/components/ui/grid-background"
import { Spotlight } from "@/components/ui/spotlight"
import { Badge } from "@/components/ui/badge"
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll"
import { AtSign } from "lucide-react"
import { DotPattern } from "@/components/ui/dot-pattern"
import { Hero } from "@/app/components/ui/hero"
import { motion, useAnimation, useInView } from "framer-motion"
import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { ElegantShape } from "@/components/ui/elegant-shape"
import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { ShinyButton } from "@/components/ui/shiny-button"
import { Squares } from "@/components/ui/squares-background"
import { type BentoItem } from "@/components/ui/bento-grid"
import { cn } from "@/lib/utils"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { LampContainer } from "@/components/ui/lamp"
import { Instrument_Serif, Inter } from 'next/font/google';
import Image from "next/image"

// Setup Instrument Serif font with italic style
const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

// Setup Inter font
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

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

// AnimatedSection Component
function AnimatedSection({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode, 
  className?: string,
  delay?: number 
}) {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const inView = useInView(ref, { amount: 0.2 });
  
  useEffect(() => {
    if (inView) {
      controls.start({
        y: 0,
        opacity: 1,
        transition: { 
          duration: 0.8, 
          delay: delay,
          ease: [0.25, 0.1, 0.25, 1.0],
        }
      });
    } else {
      controls.start({
        y: 40,
        opacity: 0,
        transition: {
          duration: 0.3,
        }
      });
    }
  }, [controls, inView, delay]);
  
  return (
    <motion.div
      ref={ref}
      initial={{ y: 40, opacity: 0 }}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const featureItems: BentoItem[] = [
  {
      title: "User Authentication",
      description: "Secure sign-up and login with email/password or OAuth providers. Supports multi-factor authentication and secure session management for developer accounts.",
      icon: <Lock className="w-6 h-6" />,
  },
  {
      title: "Developer Profiles",
      description: "Create a comprehensive developer profile showcasing your skills, experience, projects, and social links. Customize your bio and make connections with fellow developers.",
      icon: <Users className="w-6 h-6" />,
  },
  {
      title: "Code Sharing",
      description: "Share code snippets, project updates, and technical insights with syntax highlighting and version control integration. Get feedback from the community on your work.",
      icon: <Code className="w-6 h-6" />,
  },
  {
      title: "Community Engagement",
      description: "Interact with developers through likes, comments, and follows. Join discussions, collaborate on projects, and build your professional network with like-minded peers.",
      icon: <Heart className="w-6 h-6" />,
  },
  {
      title: "Content Discovery",
      description: "Explore content based on programming languages, frameworks, and topics you're interested in. Find relevant projects and developers through an intelligent recommendation system.",
      icon: <Compass className="w-6 h-6" />,
  },
  {
    title: "Notifications",
    description: "Get notified when someone follows you, comments on your posts, or mentions you in a post. You can also set up email notifications for important events.",
    icon: <Users className="w-6 h-6" />
  }
];

export default function Home() {
  // Define navigation items for the FloatingNav
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <HomeIcon className="h-4 w-4 text-zinc-300" />,
    },
    {
      name: "Features",
      link: "#features", // Assuming you add an id="features" to the Features section
      icon: <Package className="h-4 w-4 text-zinc-300" />,
    },
    {
      name: "Pricing",
      link: "#pricing", // Assuming you add an id="pricing" to the Pricing section
      icon: <DollarSign className="h-4 w-4 text-zinc-300" />,
    },
    {
      name: "FAQ",
      link: "#faq", // Assuming you add an id="faq" to the FAQ section
      icon: <HelpCircle className="h-4 w-4 text-zinc-300" />,
    },
  ];

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Fine-tuned navbar position */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/10 backdrop-blur-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 py-3">
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2">
                  <Image src="/logo.png" alt="DevConnect Logo" width={52} height={52} className="w-8 h-8" />
                  <span className="text-xl text-white font-medium">DevConnect</span>
                </Link>
              </div>
              
              <div className="hidden md:flex md:items-center md:justify-center space-x-8">
                <nav className="flex items-center space-x-8">
                  {navItems.map((item) => (
                    <Link 
                      key={item.name} 
                      href={item.link}
                      className="text-zinc-200 hover:text-white text-sm font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              
              <div>
                <Link href="/auth/signin">
                  <Button 
                    className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 border-0"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Adjusted padding for better balance */}
        <section className="relative pt-40 pb-20 md:pt-48 md:pb-28 lg:pt-52 lg:pb-36 overflow-hidden">
          {/* Refined bottom glow effect */}
          <div className="absolute inset-x-0 bottom-0 z-0 flex items-end justify-center pointer-events-none -mb-40">
            <div className="h-40 w-[40rem] rounded-full bg-rose-500/30 opacity-200 blur-[90px] contrast-[1.2]" />
          </div>
          
          {/* Grid pattern background */}
          <div className="absolute inset-0 z-0 opacity-50" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='64' height='64' fill='none' stroke='rgb(255 255 255 / 0.07)'%3e%3cpath d='M0 .5H63.5V64'/%3e%3c/svg%3e")`,
              backgroundSize: '64px 64px'
            }}
          >
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="max-w-3xl mx-auto text-center">
              <AnimatedSection delay={0.1}>
                <div className="flex justify-center mb-10 md:mb-12">
                  <div className="bg-zinc-800/50 backdrop-blur-md px-4 py-1 rounded-full border border-zinc-700/30 shadow-sm">
                    <span className="flex items-center space-x-2 sm:space-x-3 text-[11px] sm:text-[13px] font-[350]">
                      <span className="text-zinc-100">Early Access Now Available</span>
                      <span className="h-3 w-[1px] bg-zinc-700/50" />
                      <span className="text-rose-300">Limited Spots</span>
                    </span>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2} className="relative z-10">
                <div className="relative max-w-3xl mx-auto">
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] md:leading-[1.05] font-medium mb-8 md:mb-10">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`${inter.className} text-white tracking-tight inline-block transform font-semibold`}
                    >
                      Where
                    </motion.span>{" "}
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className={instrumentSerif.className}
                      style={{ fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '1.1em' }}
                    >
                      Developers
                    </motion.span>
                    <br className="hidden md:block"/>
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className={`${inter.className} text-rose-500 tracking-tight mt-3 inline-block font-semibold`}
                    >
                      Connect Collaborate
                    </motion.span>
                  </h1>
                  
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <p className={`${inter.className} text-base text-zinc-300 mb-12 md:mb-16 max-w-xl mx-auto font-[350] leading-relaxed`}>
                  Join a thriving community where passionate developers share
                  ideas, collaborate on projects, and build the future together.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.4}>
                <div className="flex justify-center items-center gap-6 md:gap-8 mb-12 md:mb-16">
                  <Link href="/auth/signup">
                    <Button 
                      variant="outline" 
                      className="h-12 sm:h-12 text-[14px] font-medium px-8 sm:px-10 w-[240px] bg-white text-zinc-800 hover:bg-zinc-800 transition-all duration-300 rounded-lg shadow-sm border-0 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="border-t border-zinc-800/50 flex flex-col items-center pt-8 md:pt-10">
                <p className="text-sm text-zinc-500 mb-8 md:mb-10 font-[350]">Trusted by industry professionals</p>
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
            </AnimatedSection>
          </div>
        </div>

        <section id="features" className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <DotPattern
            className="[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)] opacity-[0.03]"
            width={32}
            height={32}
            cx={0.5}
            cy={0.5}
            cr={0.5}
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-center z-0">
            <div className="absolute h-40 w-[28rem] -translate-x-[190%] translate-y-[300%] rounded-full bg-rose-500/100 opacity-80 blur-[150px]" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">
                Built for Developers, by Developers
              </h2>
              <p className="font-inter text-zinc-400">
                Everything you need to connect with the developer community and showcase your work.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <BentoGrid items={featureItems} />
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection className="text-center mb-12">
                <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">
                  What Developers Are Saying
                </h2>
                <p className="font-inter text-zinc-400">
                  Join thousands of developers who have transformed their networking experience
                </p>
              </AnimatedSection>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <AnimatedSection delay={0.1}>
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
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
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
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <DotPattern
            className="[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)] opacity-[0.025]"
            width={32}
            height={32}
            cx={0.5}
            cy={0.5}
            cr={0.5}
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-center z-0">
            <div className="absolute h-40 w-[28rem] translate-x-[190%] translate-y-[200%] rounded-full bg-rose-500/100 opacity-80 blur-[150px]" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="font-inter text-zinc-400">
                Everything you need to know about DevConnect
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-zinc-800/50">
                    <AccordionTrigger className="py-4 text-lg font-medium text-zinc-100 hover:underline text-left">
                      What is DevConnect?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-zinc-400 pb-4">
                      DevConnect is a social platform designed specifically for developers to share code, collaborate on projects, and build connections with other professionals in the tech industry.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2" className="border-b border-zinc-800/50">
                    <AccordionTrigger className="py-4 text-lg font-medium text-zinc-100 hover:underline text-left">
                      How do I get started with DevConnect?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-zinc-400 pb-4">
                      Getting started is easy! Sign up for a free account, complete your developer profile with your skills and experience, and start connecting with other developers. You can share code snippets, join discussions, and discover projects right away.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3" className="border-b border-zinc-800/50">
                    <AccordionTrigger className="py-4 text-lg font-medium text-zinc-100 hover:underline text-left">
                      Is DevConnect free to use?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-zinc-400 pb-4">
                      Yes, DevConnect offers a free plan that includes basic profile customization, community discussions, limited code snippet sharing, and basic GitHub integration. For more advanced features, we offer Pro and Team plans with additional capabilities.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4" className="border-b border-zinc-800/50">
                    <AccordionTrigger className="py-4 text-lg font-medium text-zinc-100 hover:underline text-left">
                      Can I integrate my GitHub projects with DevConnect?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-zinc-400 pb-4">
                      Absolutely! DevConnect offers GitHub integration that allows you to showcase your repositories, share updates on your projects, and connect with potential collaborators. Basic integration is available on the free plan, while advanced integration features are available on our Pro and Team plans.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5" className="border-b border-zinc-800/50">
                    <AccordionTrigger className="py-4 text-lg font-medium text-zinc-100 hover:underline text-left">
                      How can DevConnect help my career as a developer?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-zinc-400 pb-4">
                      DevConnect helps you build your professional network, showcase your skills through code sharing and discussions, find collaborators for projects, and stay updated on industry trends. Many developers have found new job opportunities and valuable mentorships through connections made on our platform.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </AnimatedSection>
          </div>
        </section>

        <section id="pricing" className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <DotPattern
            className="[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)] opacity-[0.03]"
            width={32}
            height={32}
            cx={0.5}
            cy={0.5}
            cr={0.5}
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-center z-0">
            <div className="absolute h-40 w-[28rem] -translate-x-[190%] translate-y-[300%] rounded-full bg-rose-500/100 opacity-80 blur-[150px]" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="font-inter text-zinc-400">Choose the plan that's right for you</p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
              <AnimatedSection delay={0.1}>
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-8 flex flex-col h-full backdrop-blur-sm">
                  <h3 className="font-space-grotesk text-xl font-bold mb-2">Free</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-zinc-400">/month</span>
                  </div>
                  <p className="text-zinc-400 mb-6">Perfect for getting started and exploring the platform.</p>

                  <ul className="space-y-3 mb-8 flex-grow">
                    <PricingFeature key="free-feature-1">Basic profile customization</PricingFeature>
                    <PricingFeature key="free-feature-2">Join community discussions</PricingFeature>
                    <PricingFeature key="free-feature-3">Limited code snippet sharing</PricingFeature>
                    <PricingFeature key="free-feature-4">Basic GitHub integration</PricingFeature>
                  </ul>

                  <Link href="/auth/signup" className="mt-auto w-full">
                    <Button variant="outline" className="w-full">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-zinc-900/50 border-2 border-rose-500/50 rounded-xl p-8 flex flex-col h-full relative backdrop-blur-sm">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                  <h3 className="font-space-grotesk text-xl font-bold mb-2">Pro</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$9</span>
                    <span className="text-zinc-400">/month</span>
                  </div>
                  <p className="text-zinc-400 mb-6">Everything you need for serious networking and collaboration.</p>

                  <ul className="space-y-3 mb-8 flex-grow">
                    <PricingFeature key="pro-feature-1">Advanced profile customization</PricingFeature>
                    <PricingFeature key="pro-feature-2">Unlimited code snippet sharing</PricingFeature>
                    <PricingFeature key="pro-feature-3">Real-time chat with developers</PricingFeature>
                    <PricingFeature key="pro-feature-4">Full GitHub integration</PricingFeature>
                    <PricingFeature key="pro-feature-5">Priority support</PricingFeature>
                  </ul>

                  <Button className="mt-auto w-full bg-white text-zinc-950 hover:bg-zinc-200">
                    Get Pro <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-8 flex flex-col h-full backdrop-blur-sm">
                  <h3 className="font-space-grotesk text-xl font-bold mb-2">Team</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">$29</span>
                    <span className="text-zinc-400">/month</span>
                  </div>
                  <p className="text-zinc-400 mb-6">Perfect for teams working together on projects.</p>

                  <ul className="space-y-3 mb-8 flex-grow">
                    <PricingFeature key="team-feature-1">Everything in Pro</PricingFeature>
                    <PricingFeature key="team-feature-2">Team collaboration tools</PricingFeature>
                    <PricingFeature key="team-feature-3">Team project management</PricingFeature>
                    <PricingFeature key="team-feature-4">Advanced analytics</PricingFeature>
                    <PricingFeature key="team-feature-5">Dedicated support</PricingFeature>
                  </ul>

                  <Button variant="outline" className="mt-auto w-full">
                    Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-zinc-950 relative overflow-hidden">
          <DotPattern
            className="[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)] opacity-[0.025]"
            width={32}
            height={32}
            cx={0.5}
            cy={0.5}
            cr={0.5}
          />
          
          <div className="absolute inset-x-0 top-0 flex items-start justify-center z-0">
            <div className="absolute h-40 w-[28rem] translate-y-[300%] rounded-full bg-rose-500/30 opacity-80 blur-[100px]" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <h2 className="font-space-grotesk text-3xl sm:text-4xl font-bold mb-4">
                Ready to Connect with Developers?
              </h2>
              <p className="font-inter text-zinc-400 mb-8 max-w-xl mx-auto">
                Join thousands of developers already on DevConnect and start collaborating today. No credit card required
                to get started.
              </p>
              <Link href="/auth/signup">
                <Button className="h-10 px-6 text-base bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white border-0">
                  Sign Up Now
                </Button>
              </Link>
              <p className="mt-4 text-sm text-zinc-500">Free plan available. No credit card required.</p>
            </AnimatedSection>
          </div>
        </section>

        <footer className="py-16 border-t border-zinc-800/50 bg-zinc-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <AnimatedSection>
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
            </AnimatedSection>
            
            <AnimatedSection delay={0.2}>
              <div className="border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row justify-between items-center w-full max-w-3xl">
                
                <div className="mt-6 md:mt-0 text-sm text-zinc-400">
                  &copy; {new Date().getFullYear()} DevConnect. All rights reserved.
                </div>
              </div>
            </AnimatedSection>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  )
}

function BentoGrid({ items }: { items: BentoItem[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 p-4 max-w-7xl mx-auto">
            {items.map((item, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                    <div
                        className={cn(
                            "group relative flex flex-col items-center text-center",
                            "transition-all duration-300"
                        )}
                    >
                        <div className="mb-4 w-12 h-12 rounded-xl bg-black flex items-center justify-center border border-zinc-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-20"></div>
                            <div className="w-6 h-6 flex items-center justify-center text-zinc-50 relative z-10">
                                {item.icon}
                            </div>
                        </div>

                        <h3 className="font-space-grotesk text-xl font-bold tracking-tight text-zinc-100 mb-3">
                            {item.title}
                        </h3>
                        
                        <p className="font-inter text-[13px] text-zinc-400 leading-relaxed max-w-sm">
                            {item.description}
                        </p>
                    </div>
                </AnimatedSection>
            ))}
        </div>
    );
}

export { BentoGrid } 