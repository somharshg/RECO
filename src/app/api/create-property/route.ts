import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { extractTextFromPDF } from "@/lib/extract-pdf"

export async function POST(req: NextRequest) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is missing from .env.local" },
        { status: 500 }
      )
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    )

    const body = await req.formData()

    // 1. Upload thumbnail
    let thumbnailUrl = ""
    const thumbnail = body.get("thumbnail") as File | null
    if (thumbnail && thumbnail.size > 0) {
      const buffer = await thumbnail.arrayBuffer()
      const { data, error } = await admin.storage
        .from("properties")
        .upload(`thumbnails/${Date.now()}_${thumbnail.name}`, buffer, {
          contentType: thumbnail.type,
        })
      if (error) throw error
      const { data: urlData } = admin.storage
        .from("properties")
        .getPublicUrl(data.path)
      thumbnailUrl = urlData.publicUrl
    }

    // 2. Upload PDFs and extract text
    const pdfUrls: string[] = []
    let extractedText = ""
    const pdfs = body.getAll("pdfs") as File[]
    for (const pdf of pdfs) {
      if (pdf.size === 0) continue
      const buffer = await pdf.arrayBuffer()

      const { data, error } = await admin.storage
        .from("properties")
        .upload(`pdfs/${Date.now()}_${pdf.name}`, buffer, {
          contentType: pdf.type,
        })
      if (error) throw error
      const { data: urlData } = admin.storage
        .from("properties")
        .getPublicUrl(data.path)
      pdfUrls.push(urlData.publicUrl)

      const text = await extractTextFromPDF(buffer, pdf.name)
      console.log(`[PDF] ${pdf.name}: extracted ${text.length} chars`)
      extractedText += `\n\n--- ${pdf.name} ---\n${text}`
    }

    // 3. Insert row
    const { error } = await admin.from("properties").insert({
      developer_id: body.get("developerId"),
      property_name: body.get("propertyName"),
      developer_name: body.get("developerName"),
      short_description: body.get("shortDescription"),
      broker_name: body.get("brokerName"),
      broker_email: body.get("brokerEmail"),
      broker_phone: body.get("brokerPhone"),
      buyer_access: body.get("buyerAccess"),
      content_mode: body.get("contentMode"),
      thumbnail_url: thumbnailUrl,
      pdf_urls: pdfUrls.join(","),
      extracted_text: extractedText,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("RECO ERROR:", err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
