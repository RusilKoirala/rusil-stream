import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

export default async function TVWatchPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { season = '1', episode = '1' } = await searchParams;
  
  // Redirect to the existing player with TV type and episode info
  redirect(`/player?id=${id}&type=tv&season=${season}&episode=${episode}`);
}
