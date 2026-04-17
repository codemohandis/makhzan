import Link from 'next/link';
import type { Article } from '@/types';
import LanguageBadge from '@/components/public/LanguageBadge';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.created_at).toLocaleDateString('ur-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      href={`/articles/${article.id}`}
      className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-sm transition-all hover:border-burgundy/40 hover:shadow-md"
    >
      <LanguageBadge lang={article.language} />
      <h3 className="font-nastaliq text-xl leading-relaxed text-foreground line-clamp-2 transition-colors group-hover:text-accent">
        {article.title}
      </h3>
      <p className="mt-auto text-xs text-muted-foreground">{formattedDate}</p>
    </Link>
  );
}
