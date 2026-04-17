'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/articles', label: 'مضامین' },
  { href: '/books', label: 'کتب' },
  { href: '/videos', label: 'ویڈیوز' },
  { href: '/about', label: 'بارے میں' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav>
      {/* Desktop — horizontal links */}
      <ul className="hidden h-10 items-center gap-8 sm:flex">
        {navItems.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'text-white underline decoration-burgundy decoration-2 underline-offset-4'
                  : 'text-white/75 hover:text-white'
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile — hamburger toggle */}
      <div className="flex h-10 items-center sm:hidden">
        <button
          onClick={() => setOpen(!open)}
          aria-label="قائمہ کھولیں"
          className="text-white"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-t border-white/10 bg-primary pb-3 sm:hidden">
          <ul className="flex flex-col pt-2">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block px-6 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith(href)
                      ? 'bg-white/10 text-white'
                      : 'text-white/75 hover:text-white'
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
