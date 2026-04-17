import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAllVideos } from '@/lib/actions/videos';
import CmsPageHeader from '@/components/cms/CmsPageHeader';

export default async function DashboardVideosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const result = await getAllVideos();
  const videos = 'data' in result ? result.data : [];

  return (
    <main className="px-6 py-8">
      <CmsPageHeader
        title="Videos"
        action={
          <Link
            href="/dashboard/videos/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Video
          </Link>
        }
      />

      {videos.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No videos yet.{' '}
          <Link href="/dashboard/videos/new" className="text-primary underline">
            Add the first one.
          </Link>
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Lang</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">YouTube ID</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Added</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-muted/20">
                  <td className="max-w-xs truncate px-4 py-3 font-medium text-foreground" dir="rtl">
                    {video.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {video.language === 'ur' ? 'اردو' : 'فارسی'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {video.youtube_id}
                  </td>
                  <td className="tabular-nums px-4 py-3 text-muted-foreground">
                    {new Date(video.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/videos/${video.id}/edit`}
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
