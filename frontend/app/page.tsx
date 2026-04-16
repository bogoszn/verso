"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Syne } from "next/font/google";
import { cn } from "@/lib/utils";

const syne = Syne({ subsets: ["latin"], weight: ["700"] });

export default function LandingPage() {
    return (
        <div className="h-screen w-full bg-[#0f0e0d] flex flex-col items-center justify-center overflow-hidden relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center z-10"
            >
                <div className="w-[84px] h-[84px] bg-accent rounded-[20px] flex items-center justify-center shadow-[0_0_40px_rgba(200,184,154,0.15)] mb-8">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0f0e0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>

                <h1 className={cn("text-[48px] text-[#e8e3da] tracking-wide mb-10", syne.className)}>
                    Verso
                </h1>

                <Link
                    href="/dashboard"
                    className="bg-[#161412] hover:bg-[#1c1a18] border border-[#2a2825] text-[#e8e3da] px-10 py-3.5 rounded-xl transition-all font-medium shadow-xl hover:-translate-y-0.5"
                >
                    Open app
                </Link>
            </motion.div>

            {/* Editorial aesthetic ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />
        </div>
    );
}
