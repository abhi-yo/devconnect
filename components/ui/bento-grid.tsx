"use client";

import { cn } from "@/lib/utils";
import {
    CheckCircle,
    Clock,
    Star,
    TrendingUp,
    Video,
    Globe,
} from "lucide-react";

export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
}

interface BentoGridProps {
    items: BentoItem[];
}

function BentoGrid({ items }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 p-4 max-w-7xl mx-auto">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "group relative flex flex-col",
                        "transition-all duration-300"
                    )}
                >
                    <div className="mb-4 w-12 h-12 rounded-xl bg-black flex items-center justify-center border border-zinc-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-60"></div>
                        <div className="w-6 h-6 flex items-center justify-center text-rose-500 relative z-10">
                            {item.icon}
                        </div>
                    </div>

                    <h3 className="font-space-grotesk text-xl font-semibold tracking-tight text-zinc-100 mb-3">
                        {item.title}
                    </h3>
                    
                    <p className="font-inter text-[10px] text-zinc-400 leading-relaxed max-w-sm">
                        {item.description}
                    </p>
                </div>
            ))}
        </div>
    );
}

export { BentoGrid } 