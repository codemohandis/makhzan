import Link from 'next/link';
import Image from 'next/image';
import { Download } from 'lucide-react';
import type { Book } from '@/types';
import LanguageBadge from '@/components/public/LanguageBadge';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/4] bg-muted">
        {book.thumbnail_url ? (
          <Image
            src={book.thumbnail_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
            📖
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <LanguageBadge lang={book.language} />
        <h3 className="font-nastaliq text-lg leading-relaxed text-foreground line-clamp-2 transition-colors group-hover:text-accent">
          {book.title}
        </h3>
        {book.can_download && (
          <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="h-3 w-3" />
            <span>ڈاؤن لوڈ دستیاب</span>
          </div>
        )}
      </div>
    </Link>
  );
}
