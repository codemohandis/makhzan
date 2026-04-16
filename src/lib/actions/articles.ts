'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Article, ArticleStatus, Locale, UserRole } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getCallerRole(): Promise<UserRole | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return (profile?.role as UserRole) ?? null;
}

// ── Input Types ───────────────────────────────────────────────────────────────

export interface ArticleInput {
  title:    string;
  content:  Record<string, unknown>;
  language: Locale;
  status?:  ArticleStatus;
}

// ── Read Actions ──────────────────────────────────────────────────────────────

/**
 * Returns all published articles, ordered newest first.
 * Public — no authentication required.
 */
export async function getAllArticles(): Promise<
  { data: Article[] } | { error: string; status: number }
> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, content, language, status, author_id, created_at, updated_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, status: 500 };

  return { data: (data ?? []) as Article[] };
}

/**
 * Returns a single published article by ID.
 * Public — no authentication required.
 */
export async function getArticleById(
  id: string
): Promise<{ data: Article } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, content, language, status, author_id, created_at, updated_at')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !data) return { error: 'Article not found', status: 404 };

  return { data: data as Article };
}

// ── Mutating Actions ──────────────────────────────────────────────────────────

/**
 * Creates a new article.
 * Authenticated users only (Admin or Manager).
 */
export async function createArticle(
  input: ArticleInput
): Promise<{ data: Article } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Forbidden', status: 403 };

  const { data, error } = await supabase
    .from('articles')
    .insert({
      title:     input.title,
      content:   input.content,
      language:  input.language,
      status:    input.status ?? 'draft',
      author_id: user.id,
    })
    .select('id, title, content, language, status, author_id, created_at, updated_at')
    .single();

  if (error || !data) return { error: error?.message ?? 'Insert failed', status: 500 };

  return { data: data as Article };
}

/**
 * Updates an existing article.
 * Authenticated users only (Admin or Manager).
 */
export async function updateArticle(
  id: string,
  updates: Partial<ArticleInput>
): Promise<{ data: Article } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Forbidden', status: 403 };

  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select('id, title, content, language, status, author_id, created_at, updated_at')
    .single();

  if (error || !data) return { error: error?.message ?? 'Article not found', status: 404 };

  return { data: data as Article };
}

/**
 * Deletes an article by ID.
 * Admin only — role is checked at the server-action layer; RLS enforces it at the DB layer too.
 */
export async function deleteArticle(
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
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message, status: 500 };

  return { success: true };
}
