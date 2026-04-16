export type Locale = 'ur' | 'fa';
export const LOCALES = ['ur', 'fa'] as const;
export const DEFAULT_LOCALE: Locale = 'ur';

// ── Auth / User ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'manager';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface ProfileWithEmail extends Profile {
  email: string;
}

// ── Books ─────────────────────────────────────────────────────────────────────

export interface Book {
  id:            string;
  title:         string;
  pdf_url:       string;
  thumbnail_url: string | null;
  language:      Locale;
  can_download:  boolean;
  author_id:     string | null;
  created_at:    string;
}

export interface BookInput {
  title:         string;
  pdf_url:       string;
  thumbnail_url?: string;
  language:      Locale;
  can_download?:  boolean;
}

// ── Videos ────────────────────────────────────────────────────────────────────

export interface Video {
  id:          string;
  title:       string;
  youtube_id:  string;
  language:    Locale;
  description: string | null;
  author_id:   string | null;
  created_at:  string;
}

export interface VideoInput {
  title:        string;
  youtube_id:   string;
  language:     Locale;
  description?: string;
}

// ── Articles ──────────────────────────────────────────────────────────────────

export type ArticleStatus   = 'draft' | 'published';
export type ArticleLanguage = 'ur' | 'fa'; // mirrors Locale; keeps Article self-contained

export interface Article {
  id:         string;
  title:      string;
  content:    Record<string, unknown> | null; // TipTap JSONB
  language:   ArticleLanguage;
  status:     ArticleStatus;
  author_id:  string | null;
  created_at: string;
  updated_at: string;
}
