'use server';

import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/types';

export async function setLocale(locale: Locale): Promise<void> {
  if (!(LOCALES as readonly string[]).includes(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  });
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get('locale')?.value;
  if (value && (LOCALES as readonly string[]).includes(value)) {
    return value as Locale;
  }
  return DEFAULT_LOCALE;
}
