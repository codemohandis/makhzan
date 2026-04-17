'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import './editor.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TipTapEditorProps {
  value:    Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
  language: 'ur' | 'fa';
  disabled?: boolean;
  placeholder?: string;
}

// ── Toolbar button ────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focus
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={[
        'flex h-7 w-7 items-center justify-center rounded transition-colors',
        'text-foreground/70 hover:bg-muted hover:text-foreground',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active ? 'bg-muted text-foreground' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border" aria-hidden />;
}

// ── Editor ────────────────────────────────────────────────────────────────────

export default function TipTapEditor({
  value,
  onChange,
  language,
  disabled = false,
  placeholder,
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // prevents SSR/hydration mismatch in Next.js
    extensions: [StarterKit],
    content: value ?? undefined,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'tiptap-prose min-h-[160px] focus:outline-none',
        dir: 'rtl',
        lang: language,
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
    onUpdate({ editor: e }) {
      onChange(e.getJSON() as Record<string, unknown>);
    },
  });

  // Sync disabled / editable
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  // Sync language attribute on the ProseMirror DOM node
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom as HTMLElement;
    dom.setAttribute('lang', language);
    dom.setAttribute('dir', 'rtl');
  }, [editor, language]);

  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  return (
    <div
      className="overflow-hidden rounded-md border border-input bg-background"
      dir="rtl"
      lang={language}
    >
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
        {/* History */}
        <ToolbarButton
          label="undo"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!canUndo || disabled}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="redo"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!canRedo || disabled}
        >
          <RotateCw className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          label="heading 2"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor?.isActive('heading', { level: 2 })}
          disabled={disabled}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="heading 3"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor?.isActive('heading', { level: 3 })}
          disabled={disabled}
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Marks */}
        <ToolbarButton
          label="bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive('bold')}
          disabled={disabled}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic')}
          disabled={disabled}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          label="bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive('bulletList')}
          disabled={disabled}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="ordered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive('orderedList')}
          disabled={disabled}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Block */}
        <ToolbarButton
          label="horizontal rule"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* ── Editable area ───────────────────────────────────────────────────── */}
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
