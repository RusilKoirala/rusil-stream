"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "../../components/Logo";

export default function ProfilesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [hoveredProfile, setHoveredProfile] = useState(null);
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

  async function selectProfile(profileId) {
    localStorage.setItem("selectedProfileId", profileId);
    router.push("/home");
  }

  async function addProfile() {
    if (!newProfileName.trim()) return;
    
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProfileName })
      });

      if (res.ok) {
        setNewProfileName("");
        setShowAddProfile(false);
        fetchUser();
      }
    } catch (error) {
      console.error("Failed to add profile:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-16">
        <Logo className="text-5xl opacity-90" />
      </div>
      
      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        Who's watching?
      </h1>

      {/* Profiles Grid */}
      <div className="flex flex-wrap gap-6 md:gap-8 justify-center max-w-5xl mb-12">
        {user?.profiles?.map((profile, index) => (
          <button
            key={profile._id}
            onClick={() => selectProfile(profile._id)}
            onMouseEnter={() => setHoveredProfile(profile._id)}
            onMouseLeave={() => setHoveredProfile(null)}
            className="group flex flex-col items-center gap-4 transition-all duration-300"
          >
            <div className="relative">
              <div
                className={`w-32 h-32 md:w-40 md:h-40 rounded-2xl flex items-center justify-center text-4xl md:text-5xl font-bold text-white transition-all duration-300 shadow-2xl ${
                  hoveredProfile === profile._id ? 'scale-110 shadow-white/20' : 'scale-100'
                } bg-gradient-to-br ${avatarGradients[index % avatarGradients.length]}`}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* Hover ring */}
              <div className={`absolute inset-0 rounded-2xl border-4 border-white transition-opacity duration-300 ${
                hoveredProfile === profile._id ? 'opacity-100' : 'opacity-0'
              }`} />
            </div>
            
            <span className={`text-lg md:text-xl font-semibold transition-all duration-300 ${
              hoveredProfile === profile._id ? 'text-white scale-110' : 'text-gray-400'
            }`}>
              {profile.name}
            </span>
          </button>
        ))}

        {/* Add Profile Button */}
        {user?.profiles?.length < 5 && !showAddProfile && (
          <button
            onClick={() => setShowAddProfile(true)}
            onMouseEnter={() => setHoveredProfile('add')}
            onMouseLeave={() => setHoveredProfile(null)}
            className="group flex flex-col items-center gap-4 transition-all duration-300"
          >
            <div className="relative">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-2xl flex items-center justify-center bg-white/5 border-2 border-dashed border-white/20 transition-all duration-300 ${
                hoveredProfile === 'add' ? 'scale-110 border-white/40 bg-white/10' : 'scale-100'
              }`}>
                <svg className={`w-16 h-16 md:w-20 md:h-20 transition-colors duration-300 ${
                  hoveredProfile === 'add' ? 'text-white' : 'text-gray-600'
                }`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            
            <span className={`text-lg md:text-xl font-semibold transition-all duration-300 ${
              hoveredProfile === 'add' ? 'text-white scale-110' : 'text-gray-400'
            }`}>
              Add Profile
            </span>
          </button>
        )}
      </div>

      {/* Add Profile Modal */}
      {showAddProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Add Profile</h3>
            <input
              type="text"
              placeholder="Enter profile name"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent mb-6 placeholder-gray-500"
              maxLength={20}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={addProfile}
                disabled={!newProfileName.trim()}
                className="flex-1 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 font-bold py-3 rounded-xl transition-all duration-200"
              >
                Add Profile
              </button>
              <button
                onClick={() => {
                  setShowAddProfile(false);
                  setNewProfileName("");
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all duration-200 border border-white/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Profiles Link */}
      <button
        onClick={() => router.push("/settings")}
        className="mt-8 text-gray-400 hover:text-white border border-gray-700 hover:border-white px-8 py-3 rounded-xl transition-all duration-200 font-medium"
      >
        Manage Profiles
      </button>
    </div>
  );
}
