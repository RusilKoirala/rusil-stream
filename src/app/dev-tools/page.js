"use client";
import { useEffect, useState } from "react";
import Logo from "../../components/Logo";

export default function DevToolsPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, []);

  async function fetchVerifications() {
    try {
      const res = await fetch("/api/admin/pending-verifications");
      const data = await res.json();
      if (res.ok) {
        setVerifications(data.verifications || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Logo className="text-4xl mb-4" />
          <h1 className="text-3xl font-bold mb-2">Development Tools</h1>
          <p className="text-gray-400">Email verification links for testing</p>
        </div>

        {verifications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Pending Verifications</h2>
            <p className="text-gray-400">Sign up for a new account to see verification links here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((verification, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{verification.email}</h3>
                    <p className="text-sm text-gray-400">
                      Created: {new Date(verification.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      Expires: {new Date(verification.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {new Date(verification.expiresAt) > new Date() ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full font-semibold">
                        Expired
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-black/40 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Verification URL:</p>
                  <p className="text-sm text-blue-400 break-all font-mono">
                    {verification.verificationUrl}
                  </p>
                </div>

                <div className="flex gap-3">
                  <a
                    href={verification.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all text-center"
                  >
                    Open Verification Link
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/auth/resend-verification", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: verification.email })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          alert("✅ Verification email resent! Check console for details.");
                          console.log("Resend response:", data);
                        } else {
                          alert("❌ Failed to resend: " + (data.error || "Unknown error"));
                          console.error("Error:", data);
                        }
                      } catch (error) {
                        alert("❌ Error: " + error.message);
                      }
                    }}
                    className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all"
                    title="Resend verification email"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(verification.verificationUrl);
                      alert("Copied to clipboard!");
                    }}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-500 mb-2">Development Mode Only</h4>
              <p className="text-sm text-gray-400">
                This page is only available in development mode. In production, users will receive verification emails via Resend.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                <strong>Note:</strong> Resend's free tier only sends emails to verified addresses. Make sure to verify your email in the Resend dashboard, or use your own verified domain.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
