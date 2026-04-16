"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSocketEditor } from "@/components/editor/useSocketEditor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorContent } from "@/components/editor/EditorContent";
import { PresenceAvatars } from "@/components/editor/PresenceAvatars";
import { TypingIndicator } from "@/components/editor/TypingIndicator";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

const ShareModal = React.lazy(() => import("@/components/editor/ShareModal").then(m => ({ default: m.ShareModal })));
const VersionHistoryPanel = React.lazy(() => import("@/components/editor/VersionHistoryPanel").then(m => ({ default: m.VersionHistoryPanel })));
import { api } from "@/lib/api";
import { Syne } from "next/font/google";
import { cn } from "@/lib/utils";

const syne = Syne({ subsets: ["latin"], weight: ["500", "700"] });

export default function EditorPage({
    documentId,
    initialTitle,
    initialContent,
    user,
    role,
    initialCollaborators
}: {
    documentId: string;
    initialTitle: string;
    initialContent: unknown;
    user: { id: string; name: string; email: string; color: string; avatarUrl: string | null };
    role: string;
    initialCollaborators: unknown[];
}) {
    const [title, setTitle] = useState(initialTitle || "Untitled");
    const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Error">("Saved");

    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const titleRef = useRef<HTMLInputElement>(null);

    const handleTitleChangeTitle = (t: string) => {
        setTitle(t);
    };

    const { editor, activeUsers, typingUsers, isConnected, emitTitleUpdate } = useSocketEditor({
        documentId,
        initialContent,
        user,
        onTitleChange: handleTitleChangeTitle
    });

    const handleLocalTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (role === 'VIEWER') return;
        const newTitle = e.target.value;
        setTitle(newTitle);
        emitTitleUpdate(newTitle);
        saveTitle(newTitle);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            editor?.commands.focus();
        }
    };

    // Auto-save logic debounced for DB
    const saveContent = useCallback(
        async (json: unknown) => {
            if (role === 'VIEWER') return;
            setSaveStatus("Saving...");
            try {
                await api.documents.update(documentId, { content: json });
                setSaveStatus("Saved");
            } catch {
                setSaveStatus("Error");
            }
        },
        [documentId, role]
    );

    const saveTitle = useCallback(
        async (newTitle: string) => {
            if (role === 'VIEWER') return;
            setSaveStatus("Saving...");
            try {
                await api.documents.update(documentId, { title: newTitle });
                setSaveStatus("Saved");
            } catch {
                setSaveStatus("Error");
            }
        },
        [documentId, role]
    );

    useEffect(() => {
        if (!editor || role === 'VIEWER') return;

        let timeout: NodeJS.Timeout;
        const onUpdate = () => {
            setSaveStatus("Saving...");
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                saveContent(editor.getJSON());
            }, 2000);
        };

        editor.on("update", onUpdate);
        return () => { editor.off("update", onUpdate); clearTimeout(timeout); };
    }, [editor, saveContent, role]);

    // Version snapshot loop (5 mins)
    useEffect(() => {
        if (role === 'VIEWER' || !editor) return;

        // Only snapshot if edited. Since we don't have dirty checks natively, just snap every 5m.
        const interval = setInterval(() => {
            api.documents.versions.create(documentId, editor.getJSON()).catch(() => { });
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [documentId, editor, role]);

    // Global Hotkeys & Mount Effects
    useEffect(() => {
        if (initialTitle === "Untitled" && titleRef.current) {
            titleRef.current.focus();
            titleRef.current.select();
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsShareOpen(false);
                setIsHistoryOpen(false);
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (editor && role !== 'VIEWER') saveContent(editor.getJSON());
            }

            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                setIsHistoryOpen(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, role, saveContent]);

    const lastEditedBy = activeUsers.length > 0 ? activeUsers[activeUsers.length - 1].userName : user.name;

    return (
        <div className="flex flex-col h-screen w-full bg-[#111009] overflow-hidden text-text-primary relative">
            <div
                aria-live="polite"
                className="sr-only"
            >
                {activeUsers.map(u => `${u.userName} joined`).join(', ')}
            </div>

            {!isConnected && (
                <ErrorBanner
                    message="Connection lost — changes may not be saving live. Reconnecting..."
                    variant="warning"
                    autoDismiss={false}
                />
            )}

            {/* Top Bar */}
            <div className="h-14 border-b border-[#2a2825] px-14 md:px-4 flex items-center justify-between shrink-0 relative z-20 bg-[#0f0e0d]">
                <div className="flex items-center gap-4 flex-1">
                    <input
                        ref={titleRef}
                        type="text"
                        value={title}
                        onChange={handleLocalTitleChange}
                        onKeyDown={handleTitleKeyDown}
                        aria-label="Document Title"
                        readOnly={role === 'VIEWER'}
                        className={cn("bg-transparent outline-none w-1/3 min-w-[150px] md:min-w-[200px] text-[14px]", syne.className, role === 'VIEWER' && "opacity-70 pointer-events-none")}
                    />
                    <div className={cn("text-[12px] font-medium flex items-center tracking-wide",
                        saveStatus === "Saved" ? "text-live" : saveStatus === "Error" ? "text-red-400" : "text-amber-500"
                    )}>
                        ● {saveStatus}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {role === 'VIEWER' && (
                        <span className="text-[10px] uppercase font-bold text-text-muted border border-[#2a2825] px-2 py-1 rounded-full">
                            View Only
                        </span>
                    )}
                    <PresenceAvatars activeUsers={activeUsers} />
                    <button
                        onClick={() => setIsShareOpen(true)}
                        className={cn("bg-accent text-background px-4 py-1.5 rounded text-[13px] font-bold hover:opacity-90 transition-opacity", syne.className)}
                    >
                        Share
                    </button>
                </div>
            </div>

            {/* Toolbar (hidden for viewer) */}
            {role !== 'VIEWER' && <EditorToolbar editor={editor} />}

            {/* Editor Content Area */}
            <div className="flex-1 overflow-y-auto w-full relative">
                <EditorContent
                    editor={editor}
                    title={title}
                    onTitleChange={handleLocalTitleChange}
                    lastEditedBy={lastEditedBy}
                    activeCount={activeUsers.length + 1}
                />
            </div>

            {/* Status Bar */}
            <div className="h-10 border-t border-[#2a2825] px-4 flex items-center justify-between shrink-0 bg-[#0f0e0d] text-text-muted text-[12px]">
                <div className="flex-1">
                    <TypingIndicator typingUsers={typingUsers} activeUsers={activeUsers} />
                </div>
                <div className="flex items-center gap-6">
                    <span className="font-medium">{activeUsers.length + 1} online</span>
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="hover:text-text-primary transition-colors underline decoration-dotted underline-offset-2"
                    >
                        Version history
                    </button>
                </div>
            </div>

            {/* Modals */}
            <Suspense fallback={null}>
                {isShareOpen && (
                    <ShareModal
                        isOpen={isShareOpen}
                        onClose={() => setIsShareOpen(false)}
                        documentId={documentId}
                        collaborators={initialCollaborators}
                        currentUserRole={role}
                    />
                )}

                {isHistoryOpen && (
                    <VersionHistoryPanel
                        isOpen={isHistoryOpen}
                        onClose={() => setIsHistoryOpen(false)}
                        documentId={documentId}
                        onRestore={(json: unknown) => {
                            if (editor && role !== 'VIEWER') {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                editor.commands.setContent(json as any);
                                saveContent(json);
                            }
                        }}
                    />
                )}
            </Suspense>
        </div>
    );
}
