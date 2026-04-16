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
