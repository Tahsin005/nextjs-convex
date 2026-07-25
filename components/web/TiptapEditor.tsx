"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { 
    Bold, 
    Italic, 
    Strikethrough, 
    Code, 
    Heading1, 
    Heading2, 
    List, 
    ListOrdered, 
    Quote,
    FileCode2,
    Eye
} from "lucide-react";

const MenuBar = ({ editor, isRawMode, toggleMode }: { editor: any, isRawMode: boolean, toggleMode: () => void }) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-1 p-1 border-b bg-muted/30">
            <div className="flex flex-wrap items-center gap-1">
                {!isRawMode && editor && (
                    <>
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
                    </>
                )}
                {isRawMode && (
                    <span className="text-sm text-muted-foreground px-2 font-medium">Raw Markdown Mode</span>
                )}
            </div>
            
            <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.preventDefault(); toggleMode(); }}
                className="h-8 gap-2 ml-auto"
                title={isRawMode ? "Switch to Visual Editor" : "Switch to Raw Markdown"}
            >
                {isRawMode ? (
                    <><Eye className="size-4" /> Visual</>
                ) : (
                    <><FileCode2 className="size-4" /> Raw</>
                )}
            </Button>
        </div>
    );
};

export function TiptapEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const [isRawMode, setIsRawMode] = useState(false);

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

    const toggleMode = () => {
        if (isRawMode) {
            editor?.commands.setContent(value);
        }
        setIsRawMode(!isRawMode);
    };

    return (
        <div className="border rounded-md shadow-sm overflow-hidden flex flex-col bg-background focus-within:ring-1 focus-within:ring-ring">
            <MenuBar editor={editor} isRawMode={isRawMode} toggleMode={toggleMode} />
            
            {isRawMode ? (
                <Textarea 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    className="min-h-[300px] border-0 focus-visible:ring-0 rounded-none shadow-none font-mono"
                    placeholder="Write something amazing in markdown..."
                />
            ) : (
                <div className="flex-1 cursor-text" onClick={() => editor?.commands.focus()}>
                    <EditorContent editor={editor} />
                </div>
            )}
            
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
