"use client";

import { usePathname, useRouter } from "next/navigation";
import { Syne } from "next/font/google";
import { UserButton, useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransition } from "react";

const syne = Syne({ subsets: ["latin"] });

interface Document {
    id: string;
    title: string;
    updatedAt: Date;
    lastEditedAt: Date;
}

interface SidebarProps {
    documents: Document[];
    createDocumentAction: () => Promise<void>;
}

export function Sidebar({ documents, createDocumentAction }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useUser();
    const activeDocumentId = pathname?.split('/doc/')[1] || null;
    const [isPending, startTransition] = useTransition();

    // Mocking Live logic for UI presentation without a global presence store
    const liveDocs = documents.filter(doc => new Date().getTime() - new Date(doc.lastEditedAt).getTime() < 1000 * 60 * 10);
    const recentDocs = documents.filter(doc => !liveDocs.some(d => d.id === doc.id)).slice(0, 15);

    const handleCreate = () => {
        startTransition(() => {
            createDocumentAction();
        });
    };

    return (
        <>
            {/* Mobile Hamburger overlay hack via checkbox */}
            <input type="checkbox" id="mobile-sidebar" className="peer hidden" />
            <label
                htmlFor="mobile-sidebar"
                className="md:hidden fixed top-3 left-4 z-[60] bg-[#161412] p-2 rounded-md border border-[#2a2825] cursor-pointer text-[#8a847c] hover:text-[#e8e3da] transition-colors shadow-lg"
                aria-label="Toggle Sidebar"
            >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M16 18h4" />
                </svg>
            </label>

            {/* Backdrop overlay */}
            <label
                htmlFor="mobile-sidebar"
                className="md:hidden fixed inset-0 bg-black/60 z-[40] opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto transition-opacity"
            />

            <div className={cn("fixed md:relative top-0 left-0 z-[50] w-[220px] h-screen bg-[#0f0e0d] border-r border-[#2a2825] flex flex-col shrink-0 overflow-hidden transform -translate-x-full md:translate-x-0 peer-checked:translate-x-0 transition-transform duration-300 ease-out", syne.className)}>
                {/* Logo Area */}
                <div className="pt-[18px] px-4 pb-6">
                    <div className="flex items-center gap-3 mb-1 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-[26px] h-[26px] bg-accent rounded-[6px] flex items-center justify-center shadow-lg">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0e0d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                        <span className="font-bold text-[16px] text-[#e8e3da] tracking-wide">Verso</span>
                    </div>
                    <div className="text-[11px] text-[#5a5650] mt-1 ml-1 truncate">
                        {user?.firstName ? `${user.firstName}'s Workspace` : 'Personal Workspace'}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-hide">
                    {/* LIVE NOW */}
                    {liveDocs.length > 0 && (
                        <div>
                            <div className="text-[10px] uppercase text-[#5a5650] font-bold px-2 mb-2 tracking-wider">Live now</div>
                            <div className="space-y-[2px]">
                                {liveDocs.map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => router.push(`/doc/${doc.id}`)}
                                        className={cn(
                                            "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-[13px] transition-colors",
                                            activeDocumentId === doc.id ? "bg-[#1e1c1a] text-text-primary" : "text-text-secondary hover:bg-[#1c1a18] hover:text-text-primary"
                                        )}
                                    >
                                        <span className="w-1.5 h-1.5 bg-live rounded-full animate-pulse shrink-0"></span>
                                        <span className="truncate">{doc.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RECENT */}
                    <div>
                        <div className="text-[10px] uppercase text-[#5a5650] font-bold px-2 mb-2 tracking-wider">Recent</div>
                        <div className="space-y-[2px]">
                            {recentDocs.map(doc => (
                                <button
                                    key={doc.id}
                                    onClick={() => router.push(`/doc/${doc.id}`)}
                                    className={cn(
                                        "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-[13px] transition-colors",
                                        activeDocumentId === doc.id ? "bg-[#1e1c1a] text-text-primary" : "text-text-secondary hover:bg-[#1c1a18] hover:text-text-primary"
                                    )}
                                >
                                    <span className="w-1.5 h-1.5 bg-[#5a5650] rounded-full shrink-0"></span>
                                    <span className="truncate">{doc.title}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={isPending}
                            className="flex items-center justify-center gap-2 w-full mt-3 py-1.5 rounded border border-[#2a2825] bg-transparent text-[#8a847c] hover:text-[#e8e3da] hover:border-[#3a3835] transition-colors text-sm disabled:opacity-50"
                        >
                            <Plus size={14} />
                            <span>{isPending ? 'Creating...' : 'New document'}</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Area */}
                <div className="p-4 border-t border-[#2a2825] flex items-center justify-between bg-[#111009]/20">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="shrink-0">
                            <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { userButtonAvatarBox: "w-7 h-7 rounded-sm" } }} />
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-[13px] text-text-primary font-medium truncate leading-tight">{user?.fullName || 'User'}</span>
                            <span className="text-[11px] text-[#5a5650]">you</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
