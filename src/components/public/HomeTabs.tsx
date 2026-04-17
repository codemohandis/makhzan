'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Article, Book, Video } from '@/types';
import ArticleCard from '@/components/public/cards/ArticleCard';
import BookCard from '@/components/public/cards/BookCard';
import VideoCard from '@/components/public/cards/VideoCard';
import SectionHeader from '@/components/public/SectionHeader';

type TabId = 'articles' | 'books' | 'videos';

interface HomeTabsProps {
  articles: Article[];
  books: Book[];
  videos: Video[];
}

const tabs: { id: TabId; label: string; href: string; emptyMsg: string }[] = [
  { id: 'articles', label: 'مضامین', href: '/articles', emptyMsg: 'ابھی کوئی مضمون نہیں' },
  { id: 'books', label: 'کتب', href: '/books', emptyMsg: 'ابھی کوئی کتاب نہیں' },
  { id: 'videos', label: 'ویڈیوز', href: '/videos', emptyMsg: 'ابھی کوئی ویڈیو نہیں' },
];

export default function HomeTabs({ articles, books, videos }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('articles');

  const current = tabs.find((t) => t.id === activeTab)!;

  return (
    <section>
      {/* Tab pills */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'pb-3 pe-4 ps-4 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section header */}
      <SectionHeader title={current.label} href={current.href} />

      {/* Content grids */}
      {activeTab === 'articles' && (
        <ContentGrid empty={current.emptyMsg} count={articles.length}>
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </ContentGrid>
      )}
      {activeTab === 'books' && (
        <ContentGrid empty={current.emptyMsg} count={books.length}>
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </ContentGrid>
      )}
      {activeTab === 'videos' && (
        <ContentGrid empty={current.emptyMsg} count={videos.length}>
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </ContentGrid>
      )}
    </section>
  );
}

function ContentGrid({
  children,
  count,
  empty,
}: {
  children: React.ReactNode;
  count: number;
  empty: string;
}) {
  if (count === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}
