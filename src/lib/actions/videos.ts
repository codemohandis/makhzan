'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Video, VideoInput } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const VIDEO_COLUMNS =
  'id, title, youtube_id, language, description, author_id, created_at';

// ── Read Actions ──────────────────────────────────────────────────────────────

/**
 * Returns all videos, ordered newest first.
 * Public — no authentication required.
 */
export async function getAllVideos(): Promise<
  { data: Video[] } | { error: string; status: number }
> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('videos')
    .select(VIDEO_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, status: 500 };

  return { data: (data ?? []) as Video[] };
}

/**
 * Returns a single video by ID.
 * Public — no authentication required.
 */
export async function getVideoById(
  id: string
): Promise<{ data: Video } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('videos')
    .select(VIDEO_COLUMNS)
    .eq('id', id)
    .single();

  if (error || !data) return { error: 'Video not found', status: 404 };

  return { data: data as Video };
}

// ── Mutating Actions ──────────────────────────────────────────────────────────

/**
 * Creates a new video entry.
 * Authenticated users only (Admin or Manager).
 * NOTE: youtube_id must be a bare YouTube ID (e.g. "dQw4w9WgXcQ") — never a full URL.
 */
export async function createVideo(
  input: VideoInput
): Promise<{ data: Video } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Forbidden', status: 403 };

  const { data, error } = await supabase
    .from('videos')
    .insert({
      title:       input.title,
      youtube_id:  input.youtube_id,
      language:    input.language,
      description: input.description ?? null,
      author_id:   user.id,
    })
    .select(VIDEO_COLUMNS)
    .single();

  if (error || !data) return { error: error?.message ?? 'Insert failed', status: 500 };

  return { data: data as Video };
}

/**
 * Updates an existing video entry.
 * Authenticated users only (Admin or Manager).
 */
export async function updateVideo(
  id: string,
  updates: Partial<VideoInput>
): Promise<{ data: Video } | { error: string; status: number }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Forbidden', status: 403 };

  const { data, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', id)
    .select(VIDEO_COLUMNS)
    .single();

  if (error || !data) return { error: error?.message ?? 'Video not found', status: 404 };

  return { data: data as Video };
}

/**
 * Deletes a video by ID.
 * Admin only — role is checked at the server-action layer; RLS enforces it at the DB layer too.
 */
export async function deleteVideo(
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
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message, status: 500 };

  return { success: true };
}
