"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [profileName, setProfileName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile() {
    if (!editingProfile || !profileName.trim()) return;

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: editingProfile,
          name: profileName
        })
      });

      if (res.ok) {
        setEditingProfile(null);
        setProfileName("");
        fetchUser();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }

  async function handleDeleteProfile(profileId) {
    if (!confirm("Are you sure you want to delete this profile? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/profile?profileId=${profileId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        fetchUser();
      }
    } catch (error) {
      console.error("Failed to delete profile:", error);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("selectedProfileId");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const avatarGradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500'
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
          <Logo className="text-3xl" />
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-12">Account Settings</h1>

        {/* Account Information */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-white rounded-full" />
            Account Information
          </h2>
          <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Email Address</label>
                <p className="text-xl font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Member Since</label>
                <p className="text-xl font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Profiles Management */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="w-1 h-8 bg-white rounded-full" />
            Manage Profiles
          </h2>
          <div className="space-y-4">
            {user?.profiles?.map((profile, index) => (
              <div
                key={profile._id}
                className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 flex-1">
                    {/* Avatar */}
                    <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]} shadow-lg`}>
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        profile.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                      {editingProfile === profile._id ? (
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 w-full max-w-xs"
                          placeholder="Profile name"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <p className="text-2xl font-semibold">{profile.name}</p>
                          <p className="text-sm text-gray-400 mt-1">Profile {index + 1}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {editingProfile === profile._id ? (
                      <>
                        <button
                          onClick={handleUpdateProfile}
                          className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-xl font-semibold transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingProfile(null);
                            setProfileName("");
                          }}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all border border-white/20"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingProfile(profile._id);
                            setProfileName(profile.name);
                          }}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all border border-white/20"
                        >
                          Edit
                        </button>
                        {user.profiles.length > 1 && (
                          <button
                            onClick={() => handleDeleteProfile(profile._id)}
                            className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold transition-all border border-red-500/20"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sign Out */}
        <section>
          <button
            onClick={handleLogout}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all border border-white/10 hover:border-white/20"
          >
            Sign Out of All Devices
          </button>
        </section>
      </main>
    </div>
  );
}
