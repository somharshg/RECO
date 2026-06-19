"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import BackButton from "@/components/BackButton"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const { id } = useParams()
  const [property, setProperty] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }, 50)
  }
  

  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText ?? input
    if (!textToSend.trim() || loading) return

    const userMessage: Message = { role: "user", content: textToSend }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          messages: [...messages, userMessage],
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
      speak(data.reply)
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const mimeType = recorder.mimeType || "audio/webm"
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setTranscribing(true)
        try {
          const formData = new FormData()
          formData.append("audio", audioBlob, mimeType.includes("mp4") ? "recording.mp4" : "recording.webm")
          const res = await fetch("/api/transcribe", { method: "POST", body: formData })
          const data = await res.json()
          if (data.text) await sendMessage(data.text)
        } finally {
          setTranscribing(false)
        }
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Microphone access was denied or unavailable." }])
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-4 mb-1">
          <BackButton />
          <a href="/" className="text-zinc-400 text-sm hover:text-white">⌂ Home</a>
        </div>
        <h1 className="text-2xl font-bold text-[#C8A76A]">
          {property ? property.property_name : "Loading..."}
        </h1>
        <p className="text-zinc-500 text-sm">AI Property Assistant</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-zinc-500 text-sm text-center mt-20">
            Ask anything about this property
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
              m.role === "user"
                ? "bg-[#C8A76A] text-black"
                : "bg-[#151515] border border-zinc-800 text-zinc-200"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#151515] border border-zinc-800 px-4 py-3 rounded-2xl text-sm text-zinc-400">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 flex gap-3">
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={transcribing || loading}
          className={`px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 ${
            recording ? "bg-red-600 text-white" : "bg-[#151515] border border-zinc-800 text-zinc-200"
          }`}
        >
          {recording ? "Stop" : transcribing ? "..." : "Mic"}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about this property..."
          className="flex-1 bg-[#151515] border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C8A76A]"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="bg-[#C8A76A] text-black px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </main>
  )
}