import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { propertyId, messages } = await req.json()

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: property, error } = await admin
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single()

    if (error || !property) {
      return NextResponse.json({ reply: "Property not found." }, { status: 404 })
    }

    const MAX_TEXT_CHARS = 60000
    const rawText = property.extracted_text || ""
    const truncated = rawText.length > MAX_TEXT_CHARS
    const documentText = truncated
      ? rawText.slice(0, MAX_TEXT_CHARS) + "\n\n[Document truncated due to length — some content may not be shown above]"
      : rawText

    const systemPrompt = `You are an AI assistant for the property: ${property.property_name}.
Developer: ${property.developer_name}
Description: ${property.short_description}

${documentText ? `Property Document Content:\n${documentText}` : "No documents have been uploaded for this property yet."}

Instructions:
- Search the document content carefully and thoroughly before responding.
- Answer questions using information found anywhere in the document, even if phrased differently.
- Provide specific details, numbers, and facts from the document when available.
- Only say you cannot find information if you have genuinely searched the entire document and it is not present.
- If the information truly cannot be found, respond with: "I could not find this information in the property documents. Please contact your broker for more information." followed by the broker details below.

Broker: ${property.broker_name}
Email: ${property.broker_email}
Phone: ${property.broker_phone}`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
    })

    const reply = completion.choices[0].message.content

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error("CHAT ERROR:", err?.message || err)
    return NextResponse.json({ reply: "Something went wrong." }, { status: 500 })
  }
}