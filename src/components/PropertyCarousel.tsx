"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function PropertyCarousel() {
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("buyer_access", "Public")
      if (!error) setProperties(data || [])
    }
    fetchProperties()
  }, [])

  if (properties.length === 0) return null

  const items = [...properties, ...properties, ...properties, ...properties]

  return (
    <div className="w-full overflow-hidden mt-20">
      <div className="flex gap-6 animate-scroll">
        {items.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="bg-[#151515] border border-zinc-800 rounded-3xl overflow-hidden flex-shrink-0 w-72"
          >
            {p.thumbnail_url && (
              <img src={p.thumbnail_url} alt={p.property_name} className="w-full h-40 object-cover" />
            )}
            <div className="p-5">
              <h3 className="text-lg font-bold text-[#C8A76A] mb-1">{p.property_name}</h3>
              <p className="text-zinc-400 text-sm">{p.developer_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}