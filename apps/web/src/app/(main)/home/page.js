import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";
import { getTrending, getPopular } from "@/lib/tmdb";
import HomePageClient from "@/components/features/HomePageClient";

export default async function HomePage() {
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect("/login");
  }

  await connectDB();
  const userDoc = await User.findById(authUser.userId).select("email profiles");
  if (!userDoc) {
    redirect("/login");
  }

  const [trendingData, moviesData] = await Promise.all([
    getTrending("all", "week", 1),
    getPopular("movie", 1),
  ]);

  const initialUser = JSON.parse(
    JSON.stringify({
      email: userDoc.email,
      profiles: userDoc.profiles || [],
    })
  );

  return (
    <HomePageClient
      initialUser={initialUser}
      initialTrending={trendingData?.results || []}
      initialMovies={moviesData?.results || []}
    />
  );
}
