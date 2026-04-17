import { Noto_Nastaliq_Urdu, Vazirmatn } from 'next/font/google';
import { getLocale } from '@/lib/actions/locale';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

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
      <body className="bg-background text-foreground" suppressHydrationWarning>
        <PublicHeader locale={locale} />
        <main>{children}</main>
        <PublicFooter />
      </body>
    </html>
  );
}
