import { Editor } from '@tiptap/react';
import { Syne } from 'next/font/google';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const syne = Syne({ subsets: ['latin'] });

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ToolbarBtn = ({ action, isActive, children }: any) => (
        <button
            onClick={() => action()}
            className={cn(
                'px-3 py-1.5 rounded transition-colors font-medium',
                isActive ? 'bg-accent text-background' : 'hover:bg-surface text-text-secondary hover:text-text-primary'
            )}
        >
            {children}
        </button>
    );

    const Separator = () => <div className="w-[1px] h-6 bg-border mx-2" />;

    return (
        <div className={cn('flex items-center gap-1 p-2 bg-background border-b border-border sticky top-0 z-10', syne.className)}>
            <ToolbarBtn action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>B</ToolbarBtn>
            <ToolbarBtn action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>I</ToolbarBtn>
            <ToolbarBtn action={() => editor.chain().focus().toggleUnderline?.().run()} isActive={editor.isActive('underline')}>U</ToolbarBtn>

            <Separator />

            <ToolbarBtn action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}>H1</ToolbarBtn>
            <ToolbarBtn action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>H2</ToolbarBtn>
            <ToolbarBtn action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}>H3</ToolbarBtn>

            <Separator />

            <ToolbarBtn action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>≡</ToolbarBtn>
            <ToolbarBtn action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>—</ToolbarBtn>
            <ToolbarBtn action={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')}>&lt;/&gt;</ToolbarBtn>

            <Separator />

            {/* These tools typically require custom extensions. Rendering stub logic. */}
            <ToolbarBtn action={() => { }} isActive={false}>✎</ToolbarBtn>
            <ToolbarBtn action={() => { }} isActive={false}>@</ToolbarBtn>
        </div>
    );
}
