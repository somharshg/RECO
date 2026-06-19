"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CreatePropertyPage() {

  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get("edit")

  const [extraFields, setExtraFields] = useState<{ key: string; value: string }[]>([])

const [formData, setFormData] = useState<{
    propertyName: string
    developerName: string
    shortDescription: string
    brokerName: string
    brokerEmail: string
    brokerPhone: string
    buyerAccess: string
    contentMode: string
    thumbnail: File | null
    pdfs: File[]
  }>({
    propertyName: "",
    developerName: "",
    shortDescription: "",
    brokerName: "",
    brokerEmail: "",
    brokerPhone: "",
    buyerAccess: "Public",
    contentMode: "AI Brief",
    thumbnail: null,
    pdfs: [],
  })

  useEffect(() => {
    if (!editId) return

    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", editId)
        .single()

      if (error || !data) return

      setFormData((prev) => ({
        ...prev,
        propertyName: data.property_name || "",
        developerName: data.developer_name || "",
        shortDescription: data.short_description || "",
        brokerName: data.broker_name || "",
        brokerEmail: data.broker_email || "",
        brokerPhone: data.broker_phone || "",
        buyerAccess: data.buyer_access || "Public",
        contentMode: data.content_mode || "AI Brief",
      }))
    }
    fetchProperty()
  }, [editId])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleThumbnailUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    setFormData({
      ...formData,
      thumbnail: file,
    })
  }

  const handlePdfUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || [])

    setFormData({
      ...formData,
      pdfs: files,
    })
  }

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("You must be logged in to create a property.")
        return
      }

      const data = new FormData()
      data.append("developerId", user.id)
      data.append("propertyName", formData.propertyName)
      data.append("developerName", formData.developerName)
      data.append("shortDescription", formData.shortDescription)
      data.append("brokerName", formData.brokerName)
      data.append("brokerEmail", formData.brokerEmail)
      data.append("brokerPhone", formData.brokerPhone)
      data.append("buyerAccess", formData.buyerAccess)
      data.append("contentMode", formData.contentMode)
      if (formData.thumbnail) data.append("thumbnail", formData.thumbnail)
      for (const pdf of formData.pdfs) data.append("pdfs", pdf)

      const endpoint = editId ? "/api/update-property" : "/api/create-property"
      if (editId) data.append("propertyId", editId)

      const res = await fetch(endpoint, { method: "POST", body: data })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error)

      alert(editId ? "Property updated successfully!" : "Property saved successfully!")
      if (editId) router.push(`/developer/property/${editId}`)
    } catch (err) {
      console.error(err)
      alert("Something went wrong. Check console.")
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white p-10">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-3">
          {editId ? "Edit Property" : "Create Property"}
        </h1>

        <p className="text-zinc-400 mb-10">
          {editId ? "Update your property details" : "Add a new property to RECO"}
        </p>

        <div className="space-y-6">

          <input
            name="propertyName"
            value={formData.propertyName}
            onChange={handleChange}
            placeholder="Property Name"
            className="w-full bg-[#151515] border border-zinc-800 rounded-xl p-4"
          />

          <input
            name="developerName"
            value={formData.developerName}
            onChange={handleChange}
            placeholder="Developer Name"
            className="w-full bg-[#151515] border border-zinc-800 rounded-xl p-4"
          />

          <input
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
            className="w-full bg-[#151515] border border-zinc-800 rounded-xl p-4"
          />

          {formData.thumbnail && (
            <p className="text-xs text-zinc-400">
              1 image selected
            </p>
          )}

          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Short Description"
            rows={4}
            className="w-full bg-[#151515] border border-zinc-800 rounded-xl p-4"
          />

          <input
            name="brokerName"
            value={formData.brokerName}
            onChange={handleChange}
            placeholder="Broker Name"
            className="w-full bg-[#151515] border border-zinc-800 rounded-xl p-4"
          />

          <input
            name="brokerEmail"
            value={formData.brokerEmail}
            onChange={handleChange}
            placeholder="Broker Email"
            className="w-full bg-[#151515] border border-zinc-800 rounded-xl p-4"
          />

          <input
            name="brokerPhone"
            value={formData.brokerPhone}
            onChange={handleChange}
            placeholder="Broker Phone"
            className="w-full bg-[#151515] border border-zinc-800 rounded-xl p-4"
          />

          {/* Buyer Access */}

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Buyer Access
            </label>

            <select
              name="buyerAccess"
              value={formData.buyerAccess}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            >
              <option>Public</option>
              <option>Private</option>
            </select>
          </div>

          {/* Content Mode */}

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Shared Content
            </label>

            <select
              name="contentMode"
              value={formData.contentMode}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
            >
              <option>AI Brief</option>
              <option>Original Docs</option>
            </select>
          </div>

          {/* Dynamic Property Fields */}

          <div className="space-y-3">
            <label className="text-sm text-zinc-300">
              Additional Property Details
            </label>

            {extraFields.map((field, i) => (
              <div key={i} className="flex gap-3">
                <input
                  placeholder="Field name"
                  value={field.key}
                  onChange={(e) => {
                    const updated = [...extraFields]
                    updated[i].key = e.target.value
                    setExtraFields(updated)
                  }}
                  className="w-1/2 bg-[#151515] border border-zinc-800 rounded-xl p-3 text-sm"
                />
                <input
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => {
                    const updated = [...extraFields]
                    updated[i].value = e.target.value
                    setExtraFields(updated)
                  }}
                  className="w-1/2 bg-[#151515] border border-zinc-800 rounded-xl p-3 text-sm"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setExtraFields([...extraFields, { key: "", value: "" }])}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              + Add Field
            </button>
          </div>

          {/* Multiple PDF Upload */}

          <div>
            <label className="block mb-3 text-zinc-400">
              Upload Property Documents
            </label>

            <input
              name="pdfs"
              type="file"
              accept=".pdf"
              multiple
              onChange={handlePdfUpload}
              className="w-full bg-[#151515] border border-zinc-800 rounded-xl p-4"
            />

            {formData.pdfs.length > 0 && (
              <p className="text-xs text-zinc-400">
                {formData.pdfs.length} PDFs selected
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="bg-[#C8A76A] text-black px-6 py-3 rounded-xl font-semibold"
          >
            {editId ? "Update Property" : "Create Property"}
          </button>

        </div>

      </div>

    </main>
  )
}
