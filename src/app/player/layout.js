import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function PlayerLayout({ children }) {
  // SSR: check for auth cookie
  const auth = cookies().get("rusil_auth");
  if (!auth || auth.value !== "1") {
    redirect("/login");
  }
  return children;
}
