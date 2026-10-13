import { TVDetailScreen } from '@/components/details/tv-detail-screen';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TVDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  return <TVDetailScreen id={id} />;
}
