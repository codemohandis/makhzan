'use client';

import { useRouter } from 'next/navigation';
import { setLocale } from '@/lib/actions/locale';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types';

interface LanguageToggleProps {
  currentLocale: Locale;
}

export function LanguageToggle({ currentLocale }: LanguageToggleProps) {
  const router = useRouter();

  async function handleSwitch(locale: Locale) {
    if (locale === currentLocale) return;
    await setLocale(locale);
    router.refresh();
  }

  return (
    <div
      className="inline-flex rounded-md border border-border bg-background p-0.5 gap-0.5"
      role="group"
      aria-label="انتخاب زبان"
    >
      {(['ur', 'fa'] as Locale[]).map((locale) => (
        <button
          key={locale}
          onClick={() => handleSwitch(locale)}
          aria-pressed={currentLocale === locale}
          className={cn(
            'rounded px-3 py-1 text-sm font-medium transition-colors',
            currentLocale === locale
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {locale === 'ur' ? 'اردو' : 'فارسی'}
        </button>
      ))}
    </div>
  );
}
