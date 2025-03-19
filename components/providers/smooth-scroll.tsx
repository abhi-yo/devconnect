"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load ScrollSmoother plugin
    const script = document.createElement('script')
    script.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.2/dist/ScrollSmoother.min.js"
    script.async = true
    
    script.onload = () => {
      // @ts-ignore - ScrollSmoother is loaded from CDN
      gsap.registerPlugin(window.ScrollSmoother)
      
      const ctx = gsap.context(() => {
        // @ts-ignore - ScrollSmoother is loaded from CDN
        window.ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1,
          effects: true,
          smoothTouch: 0.1,
        })
      })

      return () => ctx.revert()
    }

    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <div ref={rootRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content">
        {children}
      </div>
    </div>
  )
} 