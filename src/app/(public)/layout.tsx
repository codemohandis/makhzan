import { Noto_Nastaliq_Urdu, Vazirmatn } from 'next/font/google';
import { getLocale } from '@/lib/actions/locale';
import { LanguageToggle } from '@/components/LanguageToggle';

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-nastaliq',
  display: 'swap',
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir="rtl"
      className={`${nastaliq.variable} ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <span className="text-lg font-semibold text-foreground tracking-wide">
              مخزن
            </span>
            <LanguageToggle currentLocale={locale} />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
