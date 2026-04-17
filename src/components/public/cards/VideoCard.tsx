import Link from 'next/link';
import Image from 'next/image';
import { Play } from 'lucide-react';
import type { Video } from '@/types';
import LanguageBadge from '@/components/public/LanguageBadge';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const formattedDate = new Date(video.created_at).toLocaleDateString('ur-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`;

  return (
    <Link
      href={`/videos/${video.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video bg-muted">
        <Image
          src={thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white">
            <Play className="h-5 w-5 fill-white" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <LanguageBadge lang={video.language} />
        <h3 className="font-nastaliq text-lg leading-relaxed text-foreground line-clamp-2 transition-colors group-hover:text-accent">
          {video.title}
        </h3>
        <p className="mt-auto text-xs text-muted-foreground">{formattedDate}</p>
      </div>
    </Link>
  );
}
