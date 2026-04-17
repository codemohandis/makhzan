import { GlobalContainer } from '@/components/GlobalContainer';
import HomeTabs from '@/components/public/HomeTabs';
import { getAllArticles } from '@/lib/actions/articles';
import { getAllBooks } from '@/lib/actions/books';
import { getAllVideos } from '@/lib/actions/videos';

export default async function HomePage() {
  const [articlesResult, booksResult, videosResult] = await Promise.all([
    getAllArticles(),
    getAllBooks(),
    getAllVideos(),
  ]);

  const articles = 'data' in articlesResult ? articlesResult.data.slice(0, 3) : [];
  const books = 'data' in booksResult ? booksResult.data.slice(0, 3) : [];
  const videos = 'data' in videosResult ? videosResult.data.slice(0, 3) : [];

  return (
    <>
      {/* Hero banner */}
      <div className="bg-primary py-12 text-center text-white sm:py-16">
        <h1 className="font-nastaliq text-4xl font-bold sm:text-5xl">مخزن</h1>
        <p className="mt-3 text-base text-white/80">اسلامی علوم و فنون کا ذخیرہ</p>
      </div>

      {/* Tabbed content sections */}
      <GlobalContainer className="py-10 sm:py-14">
        <HomeTabs articles={articles} books={books} videos={videos} />
      </GlobalContainer>
    </>
  );
}
