import { NextResponse } from "next/server";

// Demo user data for authentication (no database needed)
const users = [
  { username: "demo", password: "password123", profilePicture: "" },
  { username: "Shaksham", password: "password123", profilePicture: "https://media.istockphoto.com/id/585282190/photo/funny-donkey-on-road.jpg?s=612x612&w=0&k=20&c=5MLX9g_jVrW77IQJ0wHY8VqEvdsktLs43m38X_rtEHk=" },
  { username: "1", password: "1", profilePicture: "https://media.istockphoto.com/id/2159593477/photo/two-donkeys.jpg?s=612x612&w=0&k=20&c=CZzNWkGm8K9nuHW2SxE-Jr2SdYOewE2_nrYzxesFjAM=" }
];

export async function POST(request) {
  const { username, password } = await request.json();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Set a cookie for SSR auth (expires in 7 days)
    return NextResponse.json({ success: true, user: { username: user.username, profilePicture: user.profilePicture } }, {
      headers: {
        "Set-Cookie": `rusil_auth=1; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax` // 7 days
      }
    });
  }
  return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
}
