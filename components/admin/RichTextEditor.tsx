"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Editor } from "@tiptap/react";

type Props = {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
};

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="px-2.5 py-1.5 rounded text-sm font-semibold transition-colors"
      style={{
        background: active ? "var(--color-primary)" : "transparent",
        color: active ? "white" : "var(--color-dark)",
      }}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div
      className="flex flex-wrap gap-1 px-2 py-2 border-b"
      style={{ borderColor: "#E5E7EB", background: "#F9FAFB" }}
    >
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>
      <span className="w-px h-6 bg-gray-200 self-center mx-1" />
      <ToolbarButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>
      <span className="w-px h-6 bg-gray-200 self-center mx-1" />
      <ToolbarButton
        title="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="Paragraph"
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        ¶
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({ name, defaultValue = "", placeholder }: Props) {
  const initial = defaultValue?.trim() ? defaultValue : "";
  const [html, setHtml] = useState(initial);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
    ],
    content: initial,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-editor__content min-h-[160px] px-4 py-3 focus:outline-none text-sm",
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate: ({ editor: ed }) => {
      setHtml(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || !defaultValue?.trim()) return;
    const current = editor.getHTML();
    if (current === "<p></p>" || current !== defaultValue) {
      editor.commands.setContent(defaultValue, { emitUpdate: false });
      setHtml(defaultValue);
    }
  }, [editor, defaultValue]);

  return (
    <div
      className="rich-text-editor rounded-lg overflow-hidden"
      style={{ border: "1.5px solid #E5E7EB", background: "#fff" }}
    >
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
