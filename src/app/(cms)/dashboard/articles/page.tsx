import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminArticles } from '@/lib/actions/articles';
import CmsPageHeader from '@/components/cms/CmsPageHeader';

export default async function DashboardArticlesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const result = await getAdminArticles();
  const articles = 'data' in result ? result.data : [];

  return (
    <main className="px-6 py-8">
      <CmsPageHeader
        title="Articles"
        action={
          <Link
            href="/dashboard/articles/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        }
      />

      {articles.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No articles yet.{' '}
          <Link href="/dashboard/articles/new" className="text-primary underline">
            Create the first one.
          </Link>
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Lang</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Updated</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/20">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-foreground" dir="rtl">
                    {article.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {article.language === 'ur' ? 'اردو' : 'فارسی'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                        article.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700',
                      ].join(' ')}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {new Date(article.updated_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/articles/${article.id}/edit`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
