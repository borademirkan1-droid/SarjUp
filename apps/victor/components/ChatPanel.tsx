"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Message } from "@/lib/types";

// ─── Session yönetimi ─────────────────────────────────────────────────────────

const SESSION_STORAGE_KEY = "victor_session_id";
const MSGS_STORAGE_KEY = (sid: string) => `victor_msgs_${sid}`;

function initSession(): string {
  if (typeof window === "undefined") return "ssr";
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, newId);
  return newId;
}

function loadPersistedMessages(sid: string): Message[] {
  try {
    const raw = localStorage.getItem(MSGS_STORAGE_KEY(sid));
    if (!raw) return [];
    return (JSON.parse(raw) as Array<{ id: string; role: string; content: string; timestamp: string }>).map(m => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: new Date(m.timestamp),
    }));
  } catch { return []; }
}

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const WAKE_WORDS = ["hey victor", "hey viktor", "victor", "viktor", "ok victor"];

// Sesli komut → otomatik prompt dönüşümü
const VOICE_CMD_MAP: Record<string, string> = {
  "durum":    "Aktif görevler ve ajan durumlarını kısaca özetle.",
  "rapor":    "Son 24 saatte tamamlanan görevleri ve devam edenleri özetle.",
  "özet":     "Şarjup projesinin güncel durumunu kısaca ver.",
  "bekleyen": "Bekleyen görevler neler, öncelikli hangisi?",
  "öncelik":  "Şu an en kritik 3 görev hangisi?",
  "ne var":   "Bugün ne yapıldı, ne bekleniyor?",
};

const QUICK_CMDS = [
  { label: "Durum",    cmd: "durum" },
  { label: "Rapor",    cmd: "rapor" },
  { label: "Bekleyen", cmd: "bekleyen" },
  { label: "Öncelik",  cmd: "öncelik" },
];

const MIN_REC_MS            = 2000;
const VAD_SILENCE_THRESHOLD = 0.01;
const VAD_SILENCE_DURATION  = 1500;
const VAD_POLL_INTERVAL     = 80;
const WAKE_WORD_COOLDOWN    = 5000;

// ─── Yardımcılar ─────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 11); }

function calcRMS(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const n = (data[i] - 128) / 128;
    sum += n * n;
  }
  return Math.sqrt(sum / data.length);
}

function playBeep() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    osc.onended = () => ctx.close();
  } catch { /* sessiz geç */ }
}

// Basit markdown: kalın + satır sonları
function Markdown({ text }: { text: string }) {
  return (
    <span>
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={i} className="block">
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={j} className="font-semibold" style={{ color: "#e0e0f0" }}>{p.slice(2, -2)}</strong>
                : p
            )}
          </span>
        );
      })}
    </span>
  );
}

// ─── Durum tipi ───────────────────────────────────────────────────────────────

type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

export default function ChatPanel() {
  const [sessionId, setSessionId] = useState<string>(initSession);
  const [messages, setMessages]   = useState<Message[]>(() => {
    const sid = typeof window !== "undefined" ? (localStorage.getItem(SESSION_STORAGE_KEY) ?? "") : "";
    return loadPersistedMessages(sid);
  });
  const [input, setInput]           = useState("");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [error, setError]           = useState<string | null>(null);

  // Ref'ler — callback'lerde stale closure'ı önler
  const voiceStatusRef = useRef<VoiceStatus>("idle");
  useEffect(() => { voiceStatusRef.current = voiceStatus; }, [voiceStatus]);

  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Ses kayıt ref'leri
  const recognitionRef        = useRef<SpeechRecognition | null>(null);
  const wakeWordCooldownRef   = useRef(false);
  const recognitionAbortedRef = useRef(false);
  const mediaRecorderRef      = useRef<MediaRecorder | null>(null);
  const audioChunksRef        = useRef<Blob[]>([]);
  const isRecordingRef        = useRef(false);
  const audioContextRef       = useRef<AudioContext | null>(null);
  const analyserRef           = useRef<AnalyserNode | null>(null);
  const vadIntervalRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentAudioRef       = useRef<HTMLAudioElement | null>(null);

  // Döngüsel bağımlılıkları kıran fonksiyon ref'leri
  const startRecordingRef        = useRef<() => void>(() => {});
  const startPassiveListeningRef = useRef<() => void>(() => {});
  const speakRef                 = useRef<(text: string) => Promise<void>>(async () => {});

  // Mesajları localStorage'a kaydet
  useEffect(() => {
    if (typeof window === "undefined" || messages.length === 0) return;
    localStorage.setItem(MSGS_STORAGE_KEY(sessionId), JSON.stringify(
      messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }))
    ));
  }, [messages, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Temizlik
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      currentAudioRef.current?.pause();
      audioContextRef.current?.close();
      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // ── Yeni sohbet ───────────────────────────────────────────────────────────────

  const startNewSession = useCallback(() => {
    const newId = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, newId);
    setSessionId(newId);
    setMessages([]);
    setError(null);
  }, []);

  // ── VAD durdur ───────────────────────────────────────────────────────────────

  const stopVAD = useCallback(() => {
    if (vadIntervalRef.current) { clearInterval(vadIntervalRef.current); vadIntervalRef.current = null; }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  // ── TTS ──────────────────────────────────────────────────────────────────────

  const speak = useCallback(async (text: string) => {
    setVoiceStatus("speaking");
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
        setVoiceStatus("idle");
        startPassiveListeningRef.current();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
        setVoiceStatus("idle");
      };
      await audio.play();
    } catch {
      setVoiceStatus("idle");
    }
  }, []);

  useEffect(() => { speakRef.current = speak; }, [speak]);

  // ── Mesaj gönder ─────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string, withVoice = false) => {
    if (!text.trim()) return;
    setError(null);

    const userMsg: Message = { id: uid(), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    if (voiceStatusRef.current !== "speaking") setVoiceStatus("processing");

    try {
      const history = messagesRef.current.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, session_id: sessionId }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Victor cevap veremedi.");
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply     = "";
      let bubbleCreated = false;
      const aId = uid();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullReply += decoder.decode(value, { stream: true });
        if (!bubbleCreated) {
          bubbleCreated = true;
          setMessages(prev => [...prev, { id: aId, role: "assistant", content: fullReply, timestamp: new Date() }]);
        } else {
          setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: fullReply } : m));
        }
      }

      if (withVoice && fullReply.trim()) {
        await speakRef.current(fullReply);
      } else {
        setVoiceStatus("idle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setVoiceStatus("idle");
    }
  }, [sessionId]);

  // ── Kayıt durdur ─────────────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    stopVAD();
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }, [stopVAD]);

  // ── Ses işle (Whisper → komut tespiti → Claude) ──────────────────────────────

  const processAudio = useCallback(async (blob: Blob) => {
    setVoiceStatus("processing");
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!res.ok) throw new Error("Transkripsiyon başarısız.");
      const { text } = await res.json() as { text: string };

      if (!text?.trim()) {
        setVoiceStatus("idle");
        setTimeout(() => startPassiveListeningRef.current(), 300);
        return;
      }

      // Sesli komut kontrolü
      const lower = text.toLowerCase().trim();
      const match = Object.entries(VOICE_CMD_MAP).find(([cmd]) => lower.includes(cmd));
      const prompt = match ? match[1] : text;

      await sendMessage(prompt, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ses işlenemedi.");
      setVoiceStatus("idle");
      setTimeout(() => startPassiveListeningRef.current(), 1500);
    }
  }, [sendMessage]);

  // ── Kayıt başlat ─────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return;
    try {
      currentAudioRef.current?.pause();
      currentAudioRef.current = null;
      setError(null);

      const stream  = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime    = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        processAudio(new Blob(audioChunksRef.current, { type: "audio/webm" }));
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      isRecordingRef.current   = true;
      setVoiceStatus("listening");
      playBeep();
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);

      // VAD
      const audioCtx  = new AudioContext();
      const analyser  = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current     = analyser;
      const dataArray  = new Uint8Array(analyser.fftSize);
      const startTime  = Date.now();

      vadIntervalRef.current = setInterval(() => {
        if (!analyserRef.current) return;
        if (Date.now() - startTime < MIN_REC_MS) return;
        analyserRef.current.getByteTimeDomainData(dataArray);
        const rms = calcRMS(dataArray);
        if (rms < VAD_SILENCE_THRESHOLD) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => stopRecording(), VAD_SILENCE_DURATION);
          }
        } else {
          if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        }
      }, VAD_POLL_INTERVAL);

    } catch {
      setError("Mikrofon erişimi reddedildi.");
      setVoiceStatus("idle");
    }
  }, [processAudio, stopRecording]);

  useEffect(() => { startRecordingRef.current = startRecording; }, [startRecording]);

  // ── Wake word algılama ────────────────────────────────────────────────────────

  const startPassiveListening = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    if (!recognitionRef.current) {
      const r = new SR();
      r.continuous      = true;
      r.interimResults  = true;
      r.lang            = "en-US";
      r.maxAlternatives = 3;

      r.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const alts: string[] = [];
        for (let i = 0; i < result.length; i++) alts.push(result[i].transcript.toLowerCase().trim());
        const s = voiceStatusRef.current;

        if (s === "idle" && !wakeWordCooldownRef.current) {
          if (alts.some(a => WAKE_WORDS.some(w => a.includes(w)))) {
            wakeWordCooldownRef.current = true;
            setTimeout(() => { wakeWordCooldownRef.current = false; }, WAKE_WORD_COOLDOWN);
            recognitionAbortedRef.current = true;
            recognitionRef.current?.abort();
            startRecordingRef.current();
          }
        } else if (s === "speaking") {
          if (alts.some(a => ["stop", "pause", "dur", "sus"].some(c => a.includes(c)))) {
            currentAudioRef.current?.pause();
            currentAudioRef.current = null;
            setVoiceStatus("idle");
          }
        }
      };

      r.onend = () => {
        if (recognitionAbortedRef.current) { recognitionAbortedRef.current = false; return; }
        const s = voiceStatusRef.current;
        if (s === "idle" || s === "speaking") {
          setTimeout(() => { try { recognitionRef.current?.start(); } catch { /* */ } }, 200);
        }
      };

      r.onerror = (e: SpeechRecognitionErrorEvent) => {
        if (e.error !== "no-speech" && e.error !== "aborted") console.warn("[WW]", e.error);
      };

      recognitionRef.current = r;
    }

    try { recognitionRef.current.start(); } catch { /* zaten başlamış */ }
  }, []);

  useEffect(() => { startPassiveListeningRef.current = startPassiveListening; }, [startPassiveListening]);

  // Wake word'ü sayfa açılınca başlat
  useEffect(() => {
    const t = setTimeout(() => startPassiveListening(), 600);
    return () => clearTimeout(t);
  }, [startPassiveListening]);

  // ── Metin gönder ─────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    const text = input.trim();
    if (!text || voiceStatus === "processing") return;
    setInput("");
    sendMessage(text, false);
  }, [input, voiceStatus, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }, [handleSubmit]);

  // ── Mikrofon butonu ───────────────────────────────────────────────────────────

  const handleMicClick = useCallback(() => {
    const s = voiceStatusRef.current;
    if (s === "idle") startRecordingRef.current();
    else if (s === "listening") { stopRecording(); setVoiceStatus("idle"); }
    else if (s === "speaking") {
      currentAudioRef.current?.pause();
      currentAudioRef.current = null;
      setVoiceStatus("idle");
    }
  }, [stopRecording]);

  // ── Hızlı komut ──────────────────────────────────────────────────────────────

  const handleQuickCmd = useCallback((cmd: string) => {
    const prompt = VOICE_CMD_MAP[cmd];
    if (prompt) sendMessage(prompt, false);
  }, [sendMessage]);

  // ─────────────────────────────────────────────────────────────────────────────

  const micBg     = voiceStatus === "listening" ? "rgba(239,68,68,0.12)"  :
                    voiceStatus === "speaking"  ? "rgba(34,197,94,0.1)"   : "#13131f";
  const micBorder = voiceStatus === "listening" ? "rgba(239,68,68,0.4)"  :
                    voiceStatus === "speaking"  ? "rgba(34,197,94,0.3)"   : "rgba(255,255,255,0.08)";
  const micColor  = voiceStatus === "listening" ? "#ef4444"               :
                    voiceStatus === "speaking"  ? "#22c55e"               : "#505068";

  return (
    <div className="h-full flex flex-col" style={{ background: "#0c0c14" }}>

      {/* Ses durumu şeridi */}
      {voiceStatus !== "idle" && (
        <div
          className="flex-shrink-0 flex items-center justify-center gap-2 py-2 text-xs"
          style={{
            background: voiceStatus === "listening" ? "rgba(239,68,68,0.06)"  :
                        voiceStatus === "speaking"  ? "rgba(34,197,94,0.06)"  :
                        "rgba(99,102,241,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: micColor }} />
          <span style={{ color: "#606080" }}>
            {voiceStatus === "listening" ? "Dinliyorum..."   :
             voiceStatus === "speaking"  ? "Victor konuşuyor" : "İşleniyor..."}
          </span>
          {voiceStatus === "speaking" && (
            <button
              onClick={() => { currentAudioRef.current?.pause(); currentAudioRef.current = null; setVoiceStatus("idle"); }}
              className="ml-1 text-[10px] underline"
              style={{ color: "#404058" }}
            >
              durdur
            </button>
          )}
        </div>
      )}

      {/* Toolbar: Yeni Sohbet butonu */}
      <div
        className="flex-shrink-0 flex items-center justify-end py-2 px-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <button
          onClick={startNewSession}
          className="text-[11px] px-2.5 py-1 rounded-lg transition-opacity opacity-40 hover:opacity-80"
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#8080a0",
          }}
        >
          Yeni Sohbet
        </button>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3 pb-8 select-none">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", color: "#00d4ff" }}
            >
              V
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium" style={{ color: "#505070" }}>Victor hazır.</p>
              <p className="text-xs" style={{ color: "#363650" }}>
                Yazın veya &ldquo;Hey Victor&rdquo; deyin
              </p>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 animate-fade-in-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.12)", color: "#00d4ff" }}
              >
                V
              </div>
            )}
            <div
              className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={msg.role === "user"
                ? { background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.12)", color: "#d0d0e8", borderBottomRightRadius: 5 }
                : { background: "#13131f", border: "1px solid rgba(255,255,255,0.06)", color: "#a0a0c0", borderBottomLeftRadius: 5 }
              }
            >
              {msg.role === "assistant" ? <Markdown text={msg.content} /> : msg.content}
            </div>
          </div>
        ))}

        {error && (
          <div className="flex justify-center animate-fade-in-up">
            <p
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ color: "#f87171", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.12)" }}
            >
              {error}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Giriş alanı */}
      <div
        className="flex-shrink-0 px-4 pt-2 pb-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Hızlı komutlar */}
        <div className="flex gap-1.5 mb-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {QUICK_CMDS.map(({ label, cmd }) => (
            <button
              key={cmd}
              onClick={() => handleQuickCmd(cmd)}
              className="flex-shrink-0 text-xs px-3 py-1 rounded-full transition-colors"
              style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", color: "#505068" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.25)";
                (e.currentTarget as HTMLButtonElement).style.color = "#00d4ff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "#505068";
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input satırı */}
        <div className="flex items-center gap-2">
          <div
            className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5"
            style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bir şey sor..."
              className="flex-1 bg-transparent outline-none text-sm min-w-0"
              style={{ color: "#d0d0e8", caretColor: "#00d4ff" }}
              disabled={voiceStatus === "processing"}
            />
          </div>

          {/* Mikrofon */}
          <button
            onClick={handleMicClick}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{ background: micBg, border: `1px solid ${micBorder}` }}
          >
            {voiceStatus === "processing" ? (
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(99,102,241,0.15)", borderTopColor: "#6366f1" }}
              />
            ) : (
              <MicIcon color={micColor} />
            )}
          </button>

          {/* Gönder */}
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || voiceStatus === "processing"}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{
              background: input.trim() ? "rgba(0,212,255,0.1)" : "#13131f",
              border: `1px solid ${input.trim() ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.06)"}`,
              opacity: input.trim() && voiceStatus !== "processing" ? 1 : 0.4,
            }}
          >
            <SendIcon color={input.trim() ? "#00d4ff" : "#404058"} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── İkonlar ─────────────────────────────────────────────────────────────────

function MicIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function SendIcon({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
