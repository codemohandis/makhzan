'use client';

import { useRouter } from 'next/navigation';
import { setLocale } from '@/lib/actions/locale';
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
    <div className="flex gap-1" role="group" aria-label="انتخاب زبان">
      <button
        onClick={() => handleSwitch('ur')}
        aria-pressed={currentLocale === 'ur'}
        className={
          currentLocale === 'ur'
            ? 'rounded px-3 py-1 text-sm font-medium bg-primary text-primary-foreground'
            : 'rounded px-3 py-1 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors'
        }
      >
        اردو
      </button>
      <button
        onClick={() => handleSwitch('fa')}
        aria-pressed={currentLocale === 'fa'}
        className={
          currentLocale === 'fa'
            ? 'rounded px-3 py-1 text-sm font-medium bg-primary text-primary-foreground'
            : 'rounded px-3 py-1 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors'
        }
      >
        فارسی
      </button>
    </div>
  );
}
