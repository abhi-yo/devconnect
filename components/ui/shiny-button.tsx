"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex h-7 items-center justify-center overflow-hidden rounded-full border border-rose-500/10 bg-zinc-900/50 px-4",
        className
      )}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(244, 63, 94, 0.15), transparent)",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(244,63,94,0.05)_0%,rgba(255,255,255,0)_100%)]" />
      <span className="relative flex items-center text-zinc-300">
        {children}
      </span>
    </button>
  );
});

ShinyButton.displayName = "ShinyButton"; 