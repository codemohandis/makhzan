import { GlobalContainer } from '@/components/GlobalContainer';
import SectionHeader from '@/components/public/SectionHeader';
import BookCard from '@/components/public/cards/BookCard';
import { getAllBooks } from '@/lib/actions/books';

export default async function BooksPage() {
  const result = await getAllBooks();

  if ('error' in result) {
    return (
      <GlobalContainer className="py-10">
        <p className="text-sm text-destructive">{result.error}</p>
      </GlobalContainer>
    );
  }

  const books = result.data;

  return (
    <GlobalContainer className="py-10 sm:py-14">
      <SectionHeader title="کتب خانہ" />

      {books.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          کوئی کتاب دستیاب نہیں۔
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </GlobalContainer>
  );
}
