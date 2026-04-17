import { GlobalContainer } from '@/components/GlobalContainer';
import SectionHeader from '@/components/public/SectionHeader';
import VideoCard from '@/components/public/cards/VideoCard';
import { getAllVideos } from '@/lib/actions/videos';

export default async function VideosPage() {
  const result = await getAllVideos();

  if ('error' in result) {
    return (
      <GlobalContainer className="py-10">
        <p className="text-sm text-destructive">{result.error}</p>
      </GlobalContainer>
    );
  }

  const videos = result.data;

  return (
    <GlobalContainer className="py-10 sm:py-14">
      <SectionHeader title="ویڈیوز" />

      {videos.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          کوئی ویڈیو دستیاب نہیں۔
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </GlobalContainer>
  );
}
