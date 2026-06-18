"use client"

import { useRouter } from "next/navigation"

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="text-zinc-400 text-sm hover:text-white"
    >
      ← Back
    </button>
  )
}