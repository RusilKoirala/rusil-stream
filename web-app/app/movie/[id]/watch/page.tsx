import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieWatchPage({ params }: PageProps) {
  const { id } = await params;
  
  // Redirect to the existing player with movie type
  redirect(`/player?id=${id}&type=movie`);
}
