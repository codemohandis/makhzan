import Link from 'next/link';
import { FileText, BookOpen, Play } from 'lucide-react';
import { GlobalContainer } from '@/components/GlobalContainer';

const modules = [
  {
    href: '/articles',
    icon: FileText,
    title: 'مضامین',
    description: 'علمی و دینی مضامین پڑھیں',
  },
  {
    href: '/books',
    icon: BookOpen,
    title: 'کتب خانہ',
    description: 'کتابیں آن لائن پڑھیں یا ڈاؤن لوڈ کریں',
  },
  {
    href: '/videos',
    icon: Play,
    title: 'ویڈیوز',
    description: 'علمی ویڈیوز دیکھیں',
  },
];

export default function HomePage() {
  return (
    <main>
      <GlobalContainer className="py-12 sm:py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">مخزن</h1>
          <p className="mt-3 text-base text-muted-foreground">
            اسلامی علوم و فنون کا ذخیرہ
          </p>
        </div>

        {/* Module cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {modules.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </GlobalContainer>
    </main>
  );
}
