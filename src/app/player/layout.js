import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PlayerLayout({ children }) {
  // SSR: check for auth cookie
  const cookieStore = await cookies();
  const auth = cookieStore.get("rusil_session");
  
  if (!auth) {
    redirect("/login");
  }
  
  return children;
}
