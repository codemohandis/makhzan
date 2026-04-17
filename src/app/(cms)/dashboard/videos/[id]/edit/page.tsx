import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import VideoForm from '@/components/cms/VideoForm';

interface EditVideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: video, error } = await supabase
    .from('videos')
    .select('id, title, youtube_id, language, description, author_id, created_at')
    .eq('id', id)
    .single();

  if (error || !video) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/dashboard/videos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Videos
      </Link>

      <CmsPageHeader title="Edit Video" />

      <VideoForm video={video} />
    </main>
  );
}
