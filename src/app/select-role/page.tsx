"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SelectRolePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUserId(user.id)

      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single()

      if (existingRole) {
        router.push(`/${existingRole.role}`)
      } else {
        setChecking(false)
      }
    }
    checkUser()
  }, [router])

  const chooseRole = async (role: string) => {
    if (!userId) return
    await supabase.from("user_roles").insert({ user_id: userId, role })
    router.push(`/${role}`)
  }

  if (checking) return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
      <p className="text-zinc-400">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-10">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-2">Choose Your Role</h1>
        <p className="text-zinc-400 mb-10">This cannot be changed later</p>

        <div className="grid md:grid-cols-3 gap-6">
          <button onClick={() => chooseRole("developer")} className="border border-zinc-800 rounded-3xl p-8 hover:border-[#C8A76A] transition">
            <h3 className="text-xl font-semibold">Developer</h3>
          </button>
          <button onClick={() => chooseRole("broker")} className="border border-zinc-800 rounded-3xl p-8 hover:border-[#C8A76A] transition">
            <h3 className="text-xl font-semibold">Broker</h3>
          </button>
          <button onClick={() => chooseRole("buyer")} className="border border-zinc-800 rounded-3xl p-8 hover:border-[#C8A76A] transition">
            <h3 className="text-xl font-semibold">Buyer</h3>
          </button>
        </div>
      </div>
    </main>
  )
}