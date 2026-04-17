import { GlobalContainer } from '@/components/GlobalContainer';
import SectionHeader from '@/components/public/SectionHeader';
import ArticleCard from '@/components/public/cards/ArticleCard';
import { getAllArticles } from '@/lib/actions/articles';

export default async function ArticlesPage() {
  const result = await getAllArticles();

  if ('error' in result) {
    return (
      <GlobalContainer className="py-10">
        <p className="text-sm text-destructive">{result.error}</p>
      </GlobalContainer>
    );
  }

  const articles = result.data;

  return (
    <GlobalContainer className="py-10 sm:py-14">
      <SectionHeader title="مضامین" />

      {articles.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          کوئی مضمون دستیاب نہیں۔
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </GlobalContainer>
  );
}
