'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Book, BookInput } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BOOK_COLUMNS =
  'id, title, pdf_url, thumbnail_url, language, can_download, author_id, created_at';

// ── Read Actions ──────────────────────────────────────────────────────────────

/**
 * Returns all books, ordered newest first.
 * Public — no authentication required.
 */
export async function getAllBooks(): Promise<
  { data: Book[] } | { error: string; status: number }
> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('books')
    .select(BOOK_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, status: 500 };

  return { data: (data ?? []) as Book[] };
}

/**
 * Returns a single book by ID.
 * Public — no authentication required.
 */
export async function getBookById(
  id: string
): Promise<{ data: Book } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('books')
    .select(BOOK_COLUMNS)
    .eq('id', id)
    .single();

  if (error || !data) return { error: 'Book not found', status: 404 };

  return { data: data as Book };
}

// ── Mutating Actions ──────────────────────────────────────────────────────────

/**
 * Creates a new book entry.
 * Authenticated users only (Admin or Manager).
 */
export async function createBook(
  input: BookInput
): Promise<{ data: Book } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Forbidden', status: 403 };

  const { data, error } = await supabase
    .from('books')
    .insert({
      title:         input.title,
      pdf_url:       input.pdf_url,
      thumbnail_url: input.thumbnail_url ?? null,
      language:      input.language,
      can_download:  input.can_download ?? true,
      author_id:     user.id,
    })
    .select(BOOK_COLUMNS)
    .single();

  if (error || !data) return { error: error?.message ?? 'Insert failed', status: 500 };

  return { data: data as Book };
}

/**
 * Updates an existing book entry.
 * Authenticated users only (Admin or Manager).
 */
export async function updateBook(
  id: string,
  updates: Partial<BookInput>
): Promise<{ data: Book } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Forbidden', status: 403 };

  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', id)
    .select(BOOK_COLUMNS)
    .single();

  if (error || !data) return { error: error?.message ?? 'Book not found', status: 404 };

  return { data: data as Book };
}

/**
 * Deletes a book by ID.
 * Admin only — role is checked at the server-action layer; RLS enforces it at the DB layer too.
 */
export async function deleteBook(
  id: string
): Promise<{ success: true } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Forbidden', status: 403 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 };

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message, status: 500 };

  return { success: true };
}
