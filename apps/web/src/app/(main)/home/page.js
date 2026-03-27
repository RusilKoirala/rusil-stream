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

  let initialUser = { email: "", profiles: [] };
  let initialTrending = [];
  let initialMovies = [];

  try {
    await connectDB();
    const userDoc = await User.findById(authUser.userId).select("email profiles");
    if (!userDoc) {
      redirect("/login");
    }
    initialUser = JSON.parse(
      JSON.stringify({
        email: userDoc.email,
        profiles: userDoc.profiles || [],
      })
    );
  } catch (e) {
    console.error("HomePage DB error:", e);
    redirect("/login");
  }

  try {
    const [trendingData, moviesData] = await Promise.all([
      getTrending("all", "week", 1),
      getPopular("movie", 1),
    ]);
    initialTrending = trendingData?.results || [];
    initialMovies = moviesData?.results || [];
  } catch (e) {
    console.error("HomePage TMDB error:", e);
  }

  return (
    <HomePageClient
      initialUser={initialUser}
      initialTrending={initialTrending}
      initialMovies={initialMovies}
    />
  );
}
