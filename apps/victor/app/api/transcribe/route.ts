import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Ses dosyasını alıp OpenAI Whisper ile metne çevirir.
// Frontend'den multipart/form-data ile "audio" alanı beklenir.
export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key tanımlı değil. .env.local dosyasını kontrol et." },
        { status: 500 }
      );
    }

    // İstemciyi handler içinde oluşturuyoruz — build sırasında key olmadığı için
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Ses dosyası bulunamadı." },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "tr", // Türkçe varsayılan; başka dil için burayı değiştir
      response_format: "json",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    // Hatayı sunucu loguna yaz, ama client'a sade mesaj dön
    console.error("[transcribe] Whisper hatası:", error);
    const message = error instanceof Error ? error.message : "Ses yazıya çevrilemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
