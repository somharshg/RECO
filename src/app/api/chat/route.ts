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

    const systemPrompt = `
You are an AI assistant for the property: ${property.property_name}.
Developer: ${property.developer_name}
Description: ${property.short_description}

Answer ONLY based on this property information.
If the answer is not available, respond exactly with:
"I could not find this information in the property documents. Please contact your broker for more information."
Then add:
Broker: ${property.broker_name}
Email: ${property.broker_email}
Phone: ${property.broker_phone}
`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    })

    const reply = completion.choices[0].message.content

    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error("CHAT ERROR:", err?.message || err)
    return NextResponse.json({ reply: "Something went wrong." }, { status: 500 })
  }
}