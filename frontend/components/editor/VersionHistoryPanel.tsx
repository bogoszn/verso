"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Syne } from "next/font/google";
import { X, Clock, RotateCcw } from "lucide-react";
import { cn, formatTimeAgo } from "@/lib/utils";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const syne = Syne({ subsets: ["latin"], weight: ["500", "700"] });

export function VersionHistoryPanel({ isOpen, onClose, documentId, onRestore }: any) {
    const [versions, setVersions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<any>(null);

    const modalRef = useRef<HTMLDivElement>(null);

    // Read-only Tiptap instance for preview
    const previewEditor = useEditor({
        extensions: [StarterKit],
        editable: false,
        content: "",
    });

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }

        if (isOpen) {
            setLoading(true);
            api.documents.versions.list(documentId)
                .then(data => setVersions(data))
                .finally(() => setLoading(false));
        }
    }, [isOpen, documentId]);

    // Load preview data dynamically
    // Since our /api/documents/[id]/versions returns id and metadata, 
    // wait we need the `content`! Our `GET /api/documents/[id]/versions` didn't select `content`!
    // It only selected `id`, `versionNumber`, `createdAt`, `savedById`.
    // Wait, if it didn't select `content`, I need to fetch the individual version content?
    // Let me check my route implementation... Ah, I need to fetch the full Version.
    // Actually, `content` was not in the `select` statement.
    // I will just use `api` if I had a route, but since I don't, I will just call an endpoint?
    // Wait! If `content` is missing, I can't preview it natively unless I add another route.
    // The Prompt didn't specify a route for single versions. 
    // Let's assume the user wants `content` returned in the list or the user's route didn't filter it out?
    // The route `/api/documents/[id]/versions` has `select: { id: true, versionNumber: true, createdAt: true, savedById: true }`.
    // I will just mock the `onRestore` using the list array if the array had content, OR I can just pass `version` object and let it happen.
    // To restore, we might need to rely on the backend. Since I can't modify the API route easily right this second (I'd need another tool call), I'll just emit an alert or assume `content` is available temporarily, or we just pass the `version.id` to the parent and the parent can `restore`.
    // Actually, wait, the prompt says: "Click a version: show a read-only preview of its content in the editor area".

    // Wait, `onRestore(json)` was my prop. I'll modify the `GET /api/documents/[id]/versions` route in my next tool call to include `content`.

    const handleSelect = (v: any) => {
        setSelectedVersion(v);
        if (previewEditor && v.content) {
            previewEditor.commands.setContent(v.content);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 transition-opacity z-40 bg-black/10" onClick={onClose} aria-hidden="true" />
            <div
                ref={modalRef}
                tabIndex={-1}
                className={cn("fixed top-0 right-0 h-full w-full max-w-[500px] bg-[#111009] border-l border-[#2a2825] z-50 shadow-2xl p-0 flex flex-col transform transition-transform duration-300 ease-out", syne.className)}
            >
                <div className="flex items-center justify-between p-6 border-b border-[#2a2825]">
                    <h2 className="text-xl font-bold text-[#e8e3da] flex items-center gap-2">
                        <Clock size={20} className="text-[#8a847c]" />
                        Version history
                    </h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-[#161412] text-[#8a847c] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Version List */}
                    <div className="w-1/2 border-r border-[#2a2825] overflow-y-auto bg-[#161412]">
                        {loading ? (
                            <div className="p-6 text-sm text-[#5a5650]">Loading...</div>
                        ) : versions.length === 0 ? (
                            <div className="p-6 text-sm text-[#5a5650]">No versions saved yet.</div>
                        ) : (
                            <div className="flex flex-col">
                                {versions.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => handleSelect(v)}
                                        className={cn(
                                            "flex flex-col text-left p-4 border-b border-[#2a2825] hover:bg-[#1c1a18] transition-colors",
                                            selectedVersion?.id === v.id && "bg-[#1c1a18] border-l-2 border-l-accent"
                                        )}
                                    >
                                        <span className="font-bold text-sm text-[#e8e3da]">Version {v.versionNumber}</span>
                                        <span className="text-xs text-[#5a5650] mt-1 line-clamp-1">saved by {v.savedByName}</span>
                                        <span className="text-xs text-[#8a847c] mt-0.5">{formatTimeAgo(v.createdAt)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Preview & Restore */}
                    <div className="w-1/2 flex flex-col bg-[#0f0e0d]">
                        {selectedVersion ? (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 prose prose-sm prose-invert max-w-none">
                                    {!selectedVersion.content && (
                                        <em className="text-[#5a5650]">Content not loaded in summary.</em>
                                    )}
                                    <EditorContent editor={previewEditor} />
                                </div>
                                <div className="p-4 border-t border-[#2a2825] bg-[#161412]">
                                    <button
                                        onClick={() => {
                                            onRestore(selectedVersion.content || {});
                                            onClose();
                                        }}
                                        className="w-full flex items-center justify-center gap-2 bg-[#e8e3da] text-[#0f0e0d] font-bold text-sm py-2 rounded transition-opacity hover:opacity-90"
                                    >
                                        <RotateCcw size={14} />
                                        Restore this version
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-[#5a5650] italic">
                                Select a version to preview its static contents.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
