import React from 'react';
import { EditorContent as TiptapEditorContent, Editor } from '@tiptap/react';
import { DM_Serif_Display } from 'next/font/google';

const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'] });

interface EditorContentProps {
    editor: Editor | null;
    title: string;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    lastEditedBy: string;
    activeCount: number;
}

export const EditorContent = React.memo(function EditorContent({ editor, title, onTitleChange, lastEditedBy, activeCount }: EditorContentProps) {
    const wordCount = editor?.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length || 0;

    return (
        <div className="w-full max-w-4xl mx-auto px-5 py-4 md:px-8 md:py-12 flex flex-col min-h-screen">
            <input
                type="text"
                value={title}
                onChange={onTitleChange}
                placeholder="Untitled"
                className={`bg-transparent text-text-primary placeholder:text-text-muted outline-none w-full text-[32px] ${dmSerif.className}`}
            />

            <div className="text-text-muted text-sm mt-3 mb-8 flex items-center gap-2 font-medium tracking-wide">
                <span>Last edited by {lastEditedBy}</span>
                <span>·</span>
                <span>{activeCount} collaborators active</span>
                <span>·</span>
                <span>{wordCount} words</span>
            </div>

            <div className="prose prose-invert prose-p:text-text-primary prose-headings:text-text-primary prose-code:text-accent prose-code:bg-surface prose-pre:bg-surface prose-blockquote:border-accent prose-blockquote:text-text-secondary prose-a:text-accent prose-li:text-text-primary max-w-none w-full min-h-[50vh]">
                <TiptapEditorContent editor={editor} />
            </div>
        </div>
    );
});
