import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("audio") as File | null

    if (!file) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 })
    }

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      response_format: "json",
      language: "en",
    })

    return NextResponse.json({ text: transcription.text })
  } catch (err: any) {
    console.error("TRANSCRIBE ERROR:", err?.message || err)
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
  }
}