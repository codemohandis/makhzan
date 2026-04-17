'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const baseItems = [
  { href: '/dashboard', label: 'Dashboard', exact: true },
  { href: '/dashboard/articles', label: 'Articles' },
  { href: '/dashboard/books', label: 'Books' },
  { href: '/dashboard/videos', label: 'Videos' },
];

interface CmsNavProps {
  isAdmin: boolean;
}

export default function CmsNav({ isAdmin }: CmsNavProps) {
  const pathname = usePathname();

  const items = isAdmin
    ? [...baseItems, { href: '/dashboard/users', label: 'Users', exact: false }]
    : baseItems;

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {items.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
