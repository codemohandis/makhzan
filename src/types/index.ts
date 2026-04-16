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
