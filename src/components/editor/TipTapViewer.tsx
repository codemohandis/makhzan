'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './editor.css';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TipTapViewerProps {
  content:  Record<string, unknown> | null;
  language: 'ur' | 'fa';
}

// ── Safe content normaliser ───────────────────────────────────────────────────
// Guards against malformed JSONB stored in the DB (e.g. `{}` or `{ foo: "bar" }`).
// TipTap tolerates an empty-string initial value and renders an empty doc.

function safeContent(raw: Record<string, unknown> | null): Record<string, unknown> | string {
  if (!raw) return '';
  // A valid TipTap doc always has { type: 'doc', content: [...] }
  if (raw.type === 'doc' && Array.isArray(raw.content)) return raw;
  // Anything else → treat as empty to avoid ProseMirror errors
  return '';
}

// ── Viewer ────────────────────────────────────────────────────────────────────

export default function TipTapViewer({ content, language }: TipTapViewerProps) {
  const editor = useEditor({
    immediatelyRender: false, // prevents SSR/hydration mismatch in Next.js
    extensions: [StarterKit],
    content: safeContent(content),
    editable: false,
    editorProps: {
      attributes: {
        class: 'tiptap-prose',
        dir: 'rtl',
        lang: language,
      },
    },
  });

  // Null content → render nothing (no crash, no raw JSON)
  if (!content) return null;

  return (
    <div dir="rtl" lang={language}>
      <EditorContent editor={editor} />
    </div>
  );
}
