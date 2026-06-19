"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-10">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">Welcome to RECO</h1>
        <p className="text-zinc-400 mb-10">Sign in to continue</p>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="bg-[#C8A76A] text-black px-8 py-4 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </main>
  )
}