import { cn } from '@/lib/utils';
import type { Locale } from '@/types';

interface LanguageBadgeProps {
  lang: Locale;
  className?: string;
}

export default function LanguageBadge({ lang, className }: LanguageBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white',
        className
      )}
    >
      {lang === 'ur' ? 'اردو' : 'فارسی'}
    </span>
  );
}
