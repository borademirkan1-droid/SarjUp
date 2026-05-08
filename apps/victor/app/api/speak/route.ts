import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { SpeakRequest } from "@/lib/types";

// Victor'un sesini üretir: OpenAI TTS, Cedar sesi, Jarvis tarzı tonlama.
// Body: { text: string }
// Response: audio/ogg (Opus codec) — mp3'ten daha hızlı encode/decode eder.
// Tarayıcı uyumsuzluğunda response_format'ı "mp3"e döndür.
export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key tanımlı değil." },
        { status: 500 }
      );
    }

    const { text }: SpeakRequest = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Metin boş olamaz." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const audio = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "cedar",
      input: text,
      // Hızlı ve doğal İngiliz AI butler tonu — "slightly slow" kaldırıldı
      instructions:
        "Speak with a natural, brisk pace like a confident British AI butler. " +
        "Crisp pronunciation, no dragging syllables. Sophisticated but efficient. " +
        "Pronounce English technical terms naturally in English.",
      response_format: "opus", // mp3'ten daha hafif ve hızlı; Safari'de çalışmazsa "mp3"e dön
      speed: 1.15,             // %15 daha hızlı — doğal akış için optimize
    });

    const buffer = Buffer.from(await audio.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        // Opus = OGG container içinde — Chrome/Firefox destekler, Safari desteklemez
        "Content-Type": "audio/ogg; codecs=opus",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[speak] OpenAI TTS hatası:", error);
    const message = error instanceof Error ? error.message : "Ses üretilemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
