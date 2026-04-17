'use client';

import { useEffect, useRef } from 'react';

interface YoutubeEmbedProps {
  videoId: string;
  title: string;
}

export default function YoutubeEmbed({ videoId, title }: YoutubeEmbedProps) {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;
    // Register the custom element on first mount (browser-only)
    import('lite-youtube-embed');
  }, []);

  return (
    <div className="overflow-hidden rounded-lg">
      <lite-youtube videoid={videoId} playlabel={title} />
    </div>
  );
}
