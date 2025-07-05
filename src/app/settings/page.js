"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [picInput, setPicInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [picTries, setPicTries] = useState(0);
  const [editField, setEditField] = useState(null); // 'username' | 'password' | 'pic'
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("rusil_username") || "");
      const pic = localStorage.getItem("rusil_profilePic") || "";
      setProfilePic(pic);
      setPicInput(pic);
    }
  }, []);

  function handlePicChange(e) {
    setPicInput(e.target.value);
    setPicTries(0);
    setProfilePic(e.target.value);
  }

  function handlePicError() {
    if (picTries < 4) {
      setPicTries(picTries + 1);
    } else {
      setProfilePic("");
      setPicInput("");
    }
  }

  function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (editField === "username" && !username.trim()) {
      setError("Username required");
      return;
    }
    if (editField === "password" && !password.trim()) {
      setError("Password required");
      return;
    }
    if (typeof window !== "undefined") {
      if (editField === "username") localStorage.setItem("rusil_username", username);
      if (editField === "pic") localStorage.setItem("rusil_profilePic", picInput);
    }
    setSuccess("Settings updated!");
    setEditField(null);
    setPassword("");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1020] via-[#101a2b] to-[#181f2e] text-white px-4">
      <div className="bg-[#181818] rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-8 mt-12">
        <div className="flex justify-center mb-4">
          <Image src="/logo/logo.png" alt="Rusil Stream Logo" width={180} height={50} />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-center">Account Settings</h2>
        <div className="flex flex-col gap-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center shadow-lg overflow-hidden">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={handlePicError}
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25v-.75z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold">Profile Picture</div>
              <div className="text-xs text-gray-400 mb-1">Change your avatar</div>
              {editField === "pic" ? (
                <form onSubmit={handleSave} className="flex gap-2 mt-2">
                  <input
                    type="url"
                    placeholder="Profile picture URL"
                    className="px-3 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] w-full"
                    value={picInput}
                    onChange={handlePicChange}
                  />
                  <button type="submit" className="bg-[#E50914] hover:bg-[#b0060f] text-white font-bold px-4 py-2 rounded-lg transition">Save</button>
                  <button type="button" className="text-gray-400 hover:underline ml-2" onClick={() => setEditField(null)}>Cancel</button>
                </form>
              ) : (
                <button type="button" className="text-[#E50914] hover:underline mt-1" onClick={() => setEditField("pic")}>Change</button>
              )}
            </div>
          </div>
          {/* Username */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="font-semibold">Username</div>
              <div className="text-xs text-gray-400 mb-1">Your display name</div>
              {editField === "username" ? (
                <form onSubmit={handleSave} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Username"
                    className="px-3 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] w-full"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                  <button type="submit" className="bg-[#E50914] hover:bg-[#b0060f] text-white font-bold px-4 py-2 rounded-lg transition">Save</button>
                  <button type="button" className="text-gray-400 hover:underline ml-2" onClick={() => setEditField(null)}>Cancel</button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{username}</span>
                  <button type="button" className="text-[#E50914] hover:underline" onClick={() => setEditField("username")}>Edit</button>
                </div>
              )}
            </div>
          </div>
          {/* Password */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="font-semibold">Password</div>
              <div className="text-xs text-gray-400 mb-1">Change your password</div>
              {editField === "password" ? (
                <form onSubmit={handleSave} className="flex gap-2 mt-2">
                  <input
                    type="password"
                    placeholder="New Password"
                    className="px-3 py-2 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] w-full"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="submit" className="bg-[#E50914] hover:bg-[#b0060f] text-white font-bold px-4 py-2 rounded-lg transition">Save</button>
                  <button type="button" className="text-gray-400 hover:underline ml-2" onClick={() => setEditField(null)}>Cancel</button>
                </form>
              ) : (
                <button type="button" className="text-[#E50914] hover:underline mt-1" onClick={() => setEditField("password")}>Change</button>
              )}
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-500 text-sm text-center">{success}</div>}
        <button type="button" className="text-gray-400 hover:underline mt-2" onClick={() => router.back()}>Back</button>
      </div>
    </div>
  );
}
