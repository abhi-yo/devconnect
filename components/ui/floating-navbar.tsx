"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const FloatingNav = ({
  navItems,
  className,
  topOffset = '1.5rem', // Default to 1.5rem (equivalent to top-6)
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
  topOffset?: string;
}) => {
  const { scrollYProgress } = useScroll();

  // Initialize visible state to true so it's visible on load
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      let direction = current! - scrollYProgress.getPrevious()!;

      // Always show the navbar when scrolling up or near the top
      if (current < 0.05 || direction < 0) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        style={{ top: topOffset }}
        className={cn(
          "flex max-w-fit fixed inset-x-0 mx-auto border border-zinc-800/50 rounded-full bg-zinc-900/80 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-3 pl-6 py-2 items-center justify-center space-x-4 backdrop-blur-sm",
          className
        )}
      >
        {navItems.map((navItem: any, idx: number) => (
          <Link
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative text-zinc-300 items-center flex space-x-1 hover:text-white transition-colors duration-200"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm font-inter font-[350]">{navItem.name}</span>
          </Link>
        ))}
        <Link href="/auth/login">
          <button className="border text-sm font-medium relative border-zinc-700 bg-zinc-800/90 text-zinc-100 px-4 py-1.5 rounded-full hover:bg-zinc-700/90 hover:border-zinc-600 transition-colors duration-200">
            <span>Login</span>
            {/* Optional glow effect for the button 
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-rose-500 to-transparent h-px" />
            */}
          </button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}; 