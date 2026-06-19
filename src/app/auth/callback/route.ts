import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase-server"

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get("code")

  const response = NextResponse.redirect(`${origin}/select-role`)

  if (code) {
    const supabase = createServerSupabase(req, response)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("[auth callback] exchange error:", error.message)
    } else {
      console.log("[auth callback] exchange succeeded")
    }
  } else {
    console.error("[auth callback] no code param in URL")
  }

  return response
}
