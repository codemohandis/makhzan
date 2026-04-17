import { getVideoById } from '@/lib/actions/videos';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GlobalContainer } from '@/components/GlobalContainer';
import LanguageBadge from '@/components/public/LanguageBadge';
import YoutubeEmbed from '@/components/public/YoutubeEmbed';

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  const result = await getVideoById(id);

  if ('error' in result) notFound();

  const video = result.data;

  const formattedDate = new Date(video.created_at).toLocaleDateString('ur-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <GlobalContainer className="py-10 sm:py-14">
      <Link
        href="/videos"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
        تمام ویڈیوز
      </Link>

      <article>
        <div className="mb-4 flex items-center gap-3">
          <LanguageBadge lang={video.language} />
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>

        <h1 className="mb-6 font-nastaliq text-3xl font-bold leading-relaxed text-foreground sm:text-4xl">
          {video.title}
        </h1>

        <YoutubeEmbed videoId={video.youtube_id} title={video.title} />

        {video.description && (
          <p className="mt-6 text-sm leading-relaxed text-foreground" dir="rtl" lang={video.language}>
            {video.description}
          </p>
        )}
      </article>
    </GlobalContainer>
  );
}
