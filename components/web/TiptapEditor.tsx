"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { Toggle } from "@/components/ui/toggle";
import { 
    Bold, 
    Italic, 
    Strikethrough, 
    Code, 
    Heading1, 
    Heading2, 
    List, 
    ListOrdered, 
    Quote 
} from "lucide-react";

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/30">
            <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('strike')}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('code')}
                onPressedChange={() => editor.chain().focus().toggleCode().run()}
                title="Code"
            >
                <Code className="h-4 w-4" />
            </Toggle>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 1 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                title="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('heading', { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('blockquote')}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                title="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </Toggle>
        </div>
    );
};

export function TiptapEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write something amazing...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Markdown,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange((editor.storage as any).markdown.getMarkdown());
        },
        immediatelyRender: false,
    });

    return (
        <div className="border rounded-md shadow-sm overflow-hidden flex flex-col bg-background focus-within:ring-1 focus-within:ring-ring">
            <MenuBar editor={editor} />
            <div className="flex-1 cursor-text" onClick={() => editor?.commands.focus()}>
                <EditorContent editor={editor} />
            </div>
            <style jsx global>{`
                .tiptap p.is-editor-empty:first-child::before {
                    color: hsl(var(--muted-foreground));
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
            `}</style>
        </div>
    )
}
