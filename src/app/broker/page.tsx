"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function BrokerPage() {
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from("properties").select("*")
      if (!error) setProperties(data || [])
    }
    fetchProperties()
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white p-10">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="text-zinc-400 text-sm mb-3 block hover:text-white">⌂ Home</a>
        <h1 className="text-5xl font-bold mb-2">Broker Dashboard</h1>
       <p className="text-zinc-400 mb-10">View your assigned properties</p>

        <div className="grid md:grid-cols-3 gap-6">
          {properties.length === 0 ? (
            <div className="h-80 border border-zinc-800 rounded-3xl flex items-center justify-center text-zinc-500">
              No Properties Assigned
            </div>
          ) : (
            properties.map((p) => (
              <a href={`/broker/property/${p.id}`} key={p.id} className="bg-[#151515] border border-zinc-800 rounded-3xl overflow-hidden block hover:border-[#C8A76A] transition-colors">
                {p.thumbnail_url && (
                  <img src={p.thumbnail_url} alt={p.property_name} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#C8A76A] mb-1">{p.property_name}</h2>
                  <p className="text-zinc-400 text-sm mb-2">{p.developer_name}</p>
                  <p className="text-zinc-500 text-sm">{p.short_description}</p>
              </div>
              </a>
            ))
          )}
       </div>
      </div>
    </main>
  )
}