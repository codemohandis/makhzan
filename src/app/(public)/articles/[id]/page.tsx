import { getArticleById } from '@/lib/actions/articles';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GlobalContainer } from '@/components/GlobalContainer';
import LanguageBadge from '@/components/public/LanguageBadge';
import TipTapViewer from '@/components/editor/TipTapViewer';

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const result = await getArticleById(id);

  if ('error' in result) notFound();

  const article = result.data;

  const formattedDate = new Date(article.created_at).toLocaleDateString('ur-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <GlobalContainer className="py-10 sm:py-14">
      <Link
        href="/articles"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
        تمام مضامین
      </Link>

      <article dir="rtl" lang={article.language}>
        <div className="mb-4 flex items-center gap-3">
          <LanguageBadge lang={article.language} />
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>

        <h1 className="mb-8 font-nastaliq text-3xl font-bold leading-relaxed text-foreground sm:text-4xl">
          {article.title}
        </h1>

        <hr className="mb-8 border-border" />

        <TipTapViewer content={article.content} language={article.language} />
      </article>
    </GlobalContainer>
  );
}
