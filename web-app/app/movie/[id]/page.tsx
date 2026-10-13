import { MovieDetailScreen } from '@/components/details/movie-detail-screen';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  return <MovieDetailScreen id={id} />;
}
