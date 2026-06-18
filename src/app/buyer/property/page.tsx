"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import BackButton from "@/components/BackButton"

export default function BuyerPropertyDetailPage() {
  const { id } = useParams()
  const [property, setProperty] = useState<any>(null)

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single()
      if (!error) setProperty(data)
    }
    fetchProperty()
  }, [id])

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