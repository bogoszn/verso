import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "text" | "avatar" | "card";
}

export function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-[#1c1a18] relative overflow-hidden",
                {
                    "h-4 w-full rounded": variant === "text",
                    "h-8 w-8 rounded-full": variant === "avatar",
                    "h-[140px] rounded-[10px] w-full": variant === "card",
                },
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
}
