"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import BackButton from "@/components/BackButton"

export default function DeveloperPropertyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !data) return

      if (data.developer_id !== user.id) {
        setDenied(true)
        return
      }

      setProperty(data)
    }
    fetchProperty()
  }, [id, router])

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this property? This cannot be undone.")
    if (!confirmed) return

    const { error } = await supabase.from("properties").delete().eq("id", id)
    if (error) {
      alert("Failed to delete property.")
      return
    }
    router.push("/developer")
  }

  if (denied) return (
    <main className="min-h-screen bg-[#0A0A0A] text-white p-10">
      <p className="text-zinc-400">You do not have access to this property.</p>
    </main>
  )

  if (!property) return (
    <main className="min-h-screen bg-[#0A0A0A] text-white p-10">
      <p className="text-zinc-400">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <a href="/" className="text-zinc-400 text-sm hover:text-white">⌂ Home</a>
        </div>
        {property.thumbnail_url && (
          <img src={property.thumbnail_url} alt={property.property_name} className="w-full h-64 object-cover rounded-2xl mb-8" />
        )}
        <h1 className="text-5xl font-bold text-[#C8A76A] mb-2">{property.property_name}</h1>
        <p className="text-zinc-400 mb-1">{property.developer_name}</p>
        <p className="text-zinc-500 mb-8">{property.short_description}</p>

        <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Broker Details</h2>
          <p className="text-zinc-300">{property.broker_name}</p>
          <p className="text-zinc-400">{property.broker_email}</p>
          <p className="text-zinc-400">{property.broker_phone}</p>
        </div>

        <div className="flex gap-3 mb-6">
          <a
            href={`/developer/create-property?edit=${id}`}
            className="flex-1 bg-zinc-800 text-white text-center font-semibold py-3 rounded-2xl hover:bg-zinc-700 transition"
          >
            Edit Property
          </a>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-900/50 text-red-300 text-center font-semibold py-3 rounded-2xl hover:bg-red-900 transition"
          >
            Delete Property
          </button>
        </div>

        <a
          href={`/chat/${id}`}
          className="block w-full bg-[#C8A76A] text-black text-center font-semibold py-4 rounded-2xl mb-6 hover:opacity-90 transition"
        >
          Chat with AI about this Property
        </a>

        <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          {property.pdf_urls ? (
            property.pdf_urls.split(",").map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-[#C8A76A] underline mb-2">
                Document {i + 1}
              </a>
            ))
          ) : (
            <p className="text-zinc-500">No documents uploaded</p>
          )}
        </div>
      </div>
    </main>
  )
}