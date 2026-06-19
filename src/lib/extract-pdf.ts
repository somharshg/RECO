import pdfParse from "pdf-parse"
import { createCanvas } from "canvas"
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import Tesseract from "tesseract.js"

// Run pdfjs in single-threaded mode (no DOM worker available in Node.js)
GlobalWorkerOptions.workerSrc = ""

const MIN_TEXT_CHARS = 100

export async function extractTextFromPDF(
  buffer: ArrayBuffer,
  filename: string
): Promise<string> {
  // Fast path: pdf-parse handles text-layer PDFs directly
  try {
    const parsed = await pdfParse(Buffer.from(buffer))
    const text = parsed.text.trim()
    if (text.length >= MIN_TEXT_CHARS) {
      return parsed.text
    }
    console.log(`[PDF] ${filename}: only ${text.length} chars from pdf-parse, trying OCR`)
  } catch (err) {
    console.error(`[PDF] ${filename}: pdf-parse error:`, err)
  }

  // OCR fallback: render each page to an image and run Tesseract
  try {
    const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise
    let fullText = ""

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 })
      const canvas = createCanvas(viewport.width, viewport.height)
      const ctx = canvas.getContext("2d")

      await page.render({ canvasContext: ctx as any, viewport }).promise

      const imageBuffer = canvas.toBuffer("image/png")
      const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng")
      fullText += text + "\n"
    }

    return fullText.trim()
  } catch (err) {
    console.error(`[PDF] ${filename}: OCR error:`, err)
    return ""
  }
}
