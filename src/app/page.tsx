"use client"

import Link from "next/link"
import PropertyCarousel from "@/components/PropertyCarousel"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center px-6">

      <div className="text-center max-w-3xl">

        <p className="text-sm uppercase tracking-[0.3em] text-[#C8A76A] mb-4">
          AI-Native Real Estate Intelligence
        </p>

        <h1 className="text-7xl font-bold mb-4">
          RECO
        </h1>

        <h2 className="text-2xl text-zinc-300 mb-6">
          Real Estate Co-Pilot
        </h2>

        <p className="text-zinc-400 text-lg mb-12">
          Document → Intelligence → Trusted Conversation
        </p>

        <Link href="/login" className="inline-block border border-[#C8A76A] rounded-3xl px-10 py-5 hover:bg-[#C8A76A] hover:text-black transition">
          <h3 className="text-xl font-semibold">
            Sign In to Continue
          </h3>
        </Link>

      </div>

      <PropertyCarousel />

    </main>
  );
}