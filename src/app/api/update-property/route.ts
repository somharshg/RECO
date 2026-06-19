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
    const propertyId = body.get("propertyId") as string

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 })
    }

    const updateData: Record<string, any> = {
      property_name: body.get("propertyName"),
      developer_name: body.get("developerName"),
      short_description: body.get("shortDescription"),
      broker_name: body.get("brokerName"),
      broker_email: body.get("brokerEmail"),
      broker_phone: body.get("brokerPhone"),
      buyer_access: body.get("buyerAccess"),
      content_mode: body.get("contentMode"),
    }

    // 1. Replace thumbnail if a new one was uploaded
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
      updateData.thumbnail_url = urlData.publicUrl
    }

    // 2. Replace PDFs if new ones were uploaded
    const pdfs = body.getAll("pdfs") as File[]
    const validPdfs = pdfs.filter((p) => p.size > 0)
    if (validPdfs.length > 0) {
      const pdfUrls: string[] = []
      let extractedText = ""
      for (const pdf of validPdfs) {
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
      updateData.pdf_urls = pdfUrls.join(",")
      updateData.extracted_text = extractedText
    }

    const { error } = await admin
      .from("properties")
      .update(updateData)
      .eq("id", propertyId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("UPDATE ERROR:", err?.message || err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}