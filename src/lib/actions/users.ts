'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseServiceClient } from '@/lib/supabase/service';
import type { Profile, ProfileWithEmail, UserRole } from '@/types';

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

// ── Read Actions ──────────────────────────────────────────────────────────────

/**
 * Returns all registered users with their email and profile data.
 * Admin only — uses service role to access auth.admin.listUsers().
 */
export async function getAllUsers(): Promise<
  { data: ProfileWithEmail[] } | { error: string; status: number }
> {
  const role = await getCallerRole();
  if (role !== 'admin') return { error: 'Forbidden', status: 403 };

  const service = createSupabaseServiceClient();

  const [authResult, profilesResult] = await Promise.all([
    service.auth.admin.listUsers(),
    service.from('profiles').select('id, full_name, role, created_at'),
  ]);

  if (authResult.error) return { error: authResult.error.message, status: 500 };
  if (profilesResult.error) return { error: profilesResult.error.message, status: 500 };

  const profileMap = new Map<string, Profile>(
    (profilesResult.data as Profile[]).map((p) => [p.id, p])
  );

  const merged: ProfileWithEmail[] = authResult.data.users
    .filter((u) => profileMap.has(u.id))
    .map((u) => ({
      ...(profileMap.get(u.id) as Profile),
      email: u.email ?? '',
    }));

  return { data: merged };
}

/**
 * Returns a single user's profile + email by ID.
 * Admin only.
 */
export async function getUserById(
  id: string
): Promise<{ data: ProfileWithEmail } | { error: string; status: number }> {
  const role = await getCallerRole();
  if (role !== 'admin') return { error: 'Forbidden', status: 403 };

  const service = createSupabaseServiceClient();

  const [authResult, profileResult] = await Promise.all([
    service.auth.admin.getUserById(id),
    service.from('profiles').select('id, full_name, role, created_at').eq('id', id).single(),
  ]);

  if (authResult.error || !authResult.data.user)
    return { error: 'User not found', status: 404 };
  if (profileResult.error)
    return { error: 'User not found', status: 404 };

  const profile = profileResult.data as Profile;
  return {
    data: { ...profile, email: authResult.data.user.email ?? '' },
  };
}

// ── Mutating Actions ──────────────────────────────────────────────────────────

/**
 * Elevates or demotes a user's role.
 * Admin only — uses service role client after verifying caller is admin.
 */
export async function setUserRole(
  userId: string,
  role: UserRole
): Promise<{ data: Profile } | { error: string; status: number }> {
  if (role !== 'admin' && role !== 'manager') {
    return { error: 'Invalid role', status: 400 };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Forbidden', status: 403 };

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (callerProfile?.role !== 'admin') return { error: 'Forbidden', status: 403 };

  // RLS UPDATE policy (get_auth_role() = 'admin') enforces this at DB level too.
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('id, full_name, role, created_at')
    .single();

  if (error || !data) return { error: 'User not found', status: 404 };

  return { data: data as Profile };
}

/**
 * Updates a user's profile fields (full_name).
 * Admin only.
 */
export async function updateUser(
  id: string,
  updates: Partial<Pick<Profile, 'full_name' | 'role'>>
): Promise<{ data: Profile } | { error: string; status: number }> {
  const callerRole = await getCallerRole();
  if (callerRole !== 'admin') return { error: 'Forbidden', status: 403 };

  const service = createSupabaseServiceClient();

  const { data, error } = await service
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id, full_name, role, created_at')
    .single();

  if (error || !data) return { error: 'User not found', status: 404 };

  return { data: data as Profile };
}

/**
 * Deletes a user from auth and their profile row.
 * Admin only — irreversible.
 */
export async function deleteUser(
  id: string
): Promise<{ success: true } | { error: string; status: number }> {
  const callerRole = await getCallerRole();
  if (callerRole !== 'admin') return { error: 'Forbidden', status: 403 };

  const service = createSupabaseServiceClient();

  const { error } = await service.auth.admin.deleteUser(id);
  if (error) return { error: error.message, status: 500 };

  return { success: true };
}
