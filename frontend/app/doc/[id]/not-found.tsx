import Link from "next/link";
import { DM_Serif_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"] });

export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#111009] text-center px-6">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg mb-8">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f0e0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            <h1 className={cn("text-4xl text-[#e8e3da] mb-4", dmSerif.className)}>
                Document not found
            </h1>

            <p className="text-[#8a847c] text-sm md:text-base mb-10 max-w-md">
                This document doesn&apos;t exist or you don&apos;t have access. Check the URL or ask the owner to invite you.
            </p>

            <Link
                href="/"
                className="bg-surface hover:bg-[#2a2825] border border-[#2a2825] text-text-primary px-6 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-md"
            >
                Back to dashboard
            </Link>
        </div>
    );
}
