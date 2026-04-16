"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ErrorBannerProps {
    message: string;
    variant?: "error" | "warning" | "info";
    autoDismiss?: boolean;
    onDismiss?: () => void;
    action?: { label: string; onClick: () => void };
}

export function ErrorBanner({ message, variant = "error", autoDismiss = true, onDismiss, action }: ErrorBannerProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoDismiss) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onDismiss?.();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [autoDismiss, onDismiss]);

    if (!isVisible) return null;

    return (
        <div
            role="alert"
            className={cn(
                "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-xl shadow-black/20 flex items-center gap-3 border transition-all animate-in slide-in-from-top-4 fade-in duration-300",
                {
                    "bg-red-950/90 border-red-900/50 text-red-200": variant === "error",
                    "bg-amber-950/90 border-amber-900/50 text-amber-200": variant === "warning",
                    "bg-blue-950/90 border-blue-900/50 text-blue-200": variant === "info",
                }
            )}
        >
            <span className="text-sm font-medium">{message}</span>

            {action && (
                <button
                    onClick={action.onClick}
                    className="text-xs font-bold underline underline-offset-2 hover:opacity-80 transition-opacity ml-2 shrink-0"
                >
                    {action.label}
                </button>
            )}

            <button
                aria-label="Dismiss alert"
                onClick={() => {
                    setIsVisible(false);
                    onDismiss?.();
                }}
                className="ml-1 p-1 rounded-md hover:bg-black/20 transition-colors shrink-0 opacity-70 hover:opacity-100"
            >
                <X size={14} />
            </button>
        </div>
    );
}
