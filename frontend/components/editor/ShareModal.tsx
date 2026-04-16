"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Syne } from "next/font/google";
import { X, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const syne = Syne({ subsets: ["latin"], weight: ["500", "700"] });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ShareModal({ isOpen, onClose, documentId, collaborators: initCollabs, currentUserRole }: any) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("VIEWER");
    const [collaborators, setCollaborators] = useState(initCollabs || []);
    const [isCopied, setIsCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const modalRef = useRef<HTMLDivElement>(null);

    // Focus trap and accessibility
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setError("");

        try {
            await api.documents.access.grant(documentId, email, role);
            // Optimistically update or re-fetch. Because the API returns the access entry, not the user object.
            // Easiest is to just refresh the page or fake the user object.
            window.location.reload();
        } catch (err: unknown) {
            setError((err as Error).message);
            setLoading(false);
        }
    };

    const handleRemove = async (userId: string) => {
        try {
            await api.documents.access.revoke(documentId, userId);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setCollaborators((prev: any) => prev.filter((c: any) => c.id !== userId));
        } catch (err: unknown) {
            alert((err as Error).message);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={onClose} aria-hidden="true" />
            <div
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-label="Share Document"
                className={cn("fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#111009] border-l border-[#2a2825] z-50 shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ease-out", syne.className)}
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-[#e8e3da]">Share document</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-[#161412] text-[#8a847c] transition-colors" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 w-full mb-6 py-2.5 rounded border border-[#2a2825] bg-[#161412] hover:bg-[#1c1a18] text-[#e8e3da] text-sm font-medium transition-colors"
                >
                    {isCopied ? <Check size={16} className="text-live" /> : <Copy size={16} />}
                    {isCopied ? "Copied!" : "Copy link"}
                </button>

                <div className="h-[1px] w-full bg-[#2a2825] mb-6" />

                {currentUserRole === 'OWNER' || currentUserRole === 'ADMIN' ? (
                    <form onSubmit={handleInvite} className="mb-6 flex flex-col gap-3">
                        <label className="text-xs uppercase tracking-wider font-bold text-[#5a5650]">Invite by email</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="colleague@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="flex-1 bg-[#161412] border border-[#2a2825] rounded px-3 py-2 text-sm outline-none focus:border-accent text-[#e8e3da]"
                            />
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="bg-[#161412] border border-[#2a2825] rounded px-2 py-2 text-sm outline-none focus:border-accent text-[#e8e3da]"
                            >
                                <option value="VIEWER">Viewer</option>
                                <option value="EDITOR">Editor</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        {error && <p className="text-red-400 text-xs">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-accent text-[#0f0e0d] font-bold text-sm py-2.5 rounded hover:bg-opacity-90 transition-opacity disabled:opacity-50 mt-1"
                        >
                            {loading ? "Sending..." : "Send invite"}
                        </button>
                    </form>
                ) : (
                    <p className="text-xs text-[#8a847c] italic mb-6">Ask the owner or an admin to invite more collaborators.</p>
                )}

                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-[#5a5650] mb-4">Collaborators</h3>
                    <div className="flex flex-col gap-4">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {collaborators.map((c: any) => (
                            <div key={c.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    {c.avatarUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={c.avatarUrl} alt={c.name} className="w-8 h-8 rounded-full border border-[#2a2825] object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full border border-[#2a2825] bg-[#161412] text-xs font-bold flex items-center justify-center text-[#e8e3da]">
                                            {c.name[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-[#e8e3da]">{c.name}</span>
                                        <span className="text-xs text-[#5a5650]">{c.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-[#8a847c]">{c.role}</span>
                                    {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && c.role !== 'OWNER' && (
                                        <button
                                            onClick={() => handleRemove(c.id)}
                                            className="text-[#5a5650] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                            aria-label={`Remove ${c.name}`}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
