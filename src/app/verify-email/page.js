"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "../../components/Logo";
import Loading from "../../components/Loading";

function VerifyEmailContent() {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    async function verifyEmail() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Email verified successfully! Redirecting...");
          
          // JWT token is automatically set in httpOnly cookie by the server
          // No need to store in localStorage
          
          // Redirect to profiles page after 2 seconds
          setTimeout(() => {
            router.push("/profiles");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    }

    verifyEmail();
  }, [token, router]);

  if (status === "verifying") {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Logo className="text-5xl mb-4" />
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          {status === "success" ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Email Verified!
              </h1>
              <p className="text-gray-400 text-lg mb-6">
                {message}
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Verification Failed
              </h1>
              <p className="text-gray-400 text-lg mb-8">
                {message}
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Need help? Contact support
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
