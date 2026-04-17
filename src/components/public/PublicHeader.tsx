import { LanguageToggle } from '@/components/LanguageToggle';
import PublicLogo from '@/components/public/PublicLogo';
import PublicNav from '@/components/public/PublicNav';
import type { Locale } from '@/types';

interface PublicHeaderProps {
  locale: Locale;
}

export default function PublicHeader({ locale }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Row 1 — branding + language toggle */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <PublicLogo />
          <LanguageToggle currentLocale={locale} />
        </div>
      </div>

      {/* Row 2 — navigation bar */}
      <div className="relative bg-primary">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <PublicNav />
        </div>
      </div>
    </header>
  );
}
