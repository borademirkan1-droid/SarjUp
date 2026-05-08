"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, AppStatus } from "@/lib/types";

// ─── Sabitler ─────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

// Wake word varyantları — en-US tanıyıcı kullandığımız için İngilizce odaklı liste
// "Hey Victor" İngilizce komut; tr-TR modunda Türkçe kelimelere dönüşüyordu (örn. "afiyet olsun")
const WAKE_WORDS = [
  "hey victor", "hey viktor",
  "victor",     "viktor",
  "ok victor",  "okay victor",
];

// Stop komutları — Victor konuşurken sesi keser (en-US tanıyıcıda çalışanlar)
const STOP_COMMANDS = ["stop", "pause", "dur", "sus"];

// Wake word tetiklendikten sonra tekrar tetiklenme engelleme süresi (ms)
const WAKE_WORD_COOLDOWN_MS = 5000;

// VAD (Voice Activity Detection) sabitleri
const VAD_SILENCE_THRESHOLD = 0.01; // RMS eşiği — altı sessizlik sayılır
const VAD_SILENCE_DURATION  = 1500; // ms — 1.5sn sessizlik = kayıt bitti
const VAD_POLL_INTERVAL     = 80;   // ms — ses seviyesi ölçüm sıklığı
// Wake word tetiklenince kullanıcının konuşmaya başlaması için minimum süre
const MIN_RECORDING_MS      = 2000; // ms — ilk 2sn VAD durduramasın

// Kayıt başladığında kısa bip çalar — kullanıcıya "şimdi konuşabilirsin" sinyali verir
function playBeep() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
    osc.onended = () => ctx.close();
  } catch { /* ses bağlamı açılamazsa sessizce geç */ }
}

// Sessizlik tespiti için RMS hesaplar (0=sessizlik, 1=max ses)
function calcRMS(data: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const n = (data[i] - 128) / 128;
    sum += n * n;
  }
  return Math.sqrt(sum / data.length);
}

// ─── İkonlar ──────────────────────────────────────────────────────────────────

function MicIcon({ opacity = 1 }: { opacity?: number }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ opacity }}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

// ─── Durum göstergesi ─────────────────────────────────────────────────────────

function StatusLine({ status }: { status: AppStatus }) {
  const config: Record<AppStatus, { label: string; color: string }> = {
    off:        { label: "KAPALI",       color: "rgba(255,255,255,0.15)" },
    passive:    { label: "BEKLİYOR",     color: "rgba(0,212,255,0.45)" },
    listening:  { label: "DİNLİYORUM",  color: "#00d4ff" },
    processing: { label: "DÜŞÜNÜYOR",   color: "#ffa500" },
    speaking:   { label: "KONUŞUYOR",   color: "#00ff9d" },
    error:      { label: "HATA",        color: "#ff4444" },
  };
  const { label, color } = config[status];

  return (
    <div className="flex items-center gap-2">
      {(status === "listening" || status === "error") && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
      )}
      {status === "passive" && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color, animationDuration: "2s" }} />
      )}
      {status === "speaking" && (
        <div className="flex items-center gap-[3px]">
          {[10, 16, 22, 16, 10].map((h, i) => (
            <div key={i} className="soundwave-bar w-[3px] rounded-full"
              style={{ height: `${h}px`, background: color }} />
          ))}
        </div>
      )}
      <span className="text-[10px] font-semibold tracking-[0.2em] transition-all duration-300"
        style={{ color }}>
        {label}
      </span>
    </div>
  );
}

// ─── Mesaj balonu ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex animate-fade-in-up ${isUser ? "justify-end" : "justify-start"} gap-2`}>
      {!isUser && (
        <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: "var(--accent-dim)", border: "1px solid var(--border-bright)", color: "var(--accent)" }}>
          V
        </div>
      )}
      <div className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
        style={isUser
          ? { background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.18)", color: "#e8e8e8", borderBottomRightRadius: 4 }
          : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderBottomLeftRadius: 4 }
        }>
        {message.content}
      </div>
    </div>
  );
}

// ─── Mikrofon butonu ──────────────────────────────────────────────────────────

function MicButton({ status, onClick }: { status: AppStatus; onClick: () => void }) {
  const isOff       = status === "off";
  const isPassive   = status === "passive";
  const isListening = status === "listening";
  const isProcessing = status === "processing";
  const isSpeaking  = status === "speaking";

  // Renk ve glow state'e göre değişir
  const borderColor = isListening
    ? "rgba(0,212,255,0.55)"
    : isPassive
    ? "rgba(0,212,255,0.2)"
    : isSpeaking
    ? "rgba(0,255,157,0.35)"
    : isProcessing
    ? "rgba(255,165,0,0.35)"
    : "rgba(255,255,255,0.08)";

  const bgColor = isListening
    ? "rgba(0,212,255,0.1)"
    : isPassive
    ? "rgba(0,212,255,0.04)"
    : isSpeaking
    ? "rgba(0,255,157,0.07)"
    : isProcessing
    ? "rgba(255,165,0,0.07)"
    : "rgba(255,255,255,0.03)";

  const iconColor = isListening
    ? "var(--accent)"
    : isPassive
    ? "rgba(0,212,255,0.5)"
    : isSpeaking
    ? "#00ff9d"
    : isOff
    ? "rgba(255,255,255,0.2)"
    : "rgba(255,255,255,0.4)";

  return (
    <button
      onClick={onClick}
      aria-label="Victor mikrofon"
      className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300 select-none focus:outline-none touch-manipulation active:scale-95"
      style={{ background: bgColor, border: `1.5px solid ${borderColor}`, color: iconColor }}
    >
      {/* Dış dekoratif halka */}
      <span className="absolute inset-[-8px] rounded-full pointer-events-none"
        style={{ border: `1px solid ${borderColor}`, opacity: 0.4 }} />

      {/* Passive: yavaş pulse halkası */}
      {isPassive && (
        <span className="absolute inset-[-4px] rounded-full animate-idle-glow pointer-events-none" />
      )}

      {/* Listening: hızlı pulse halkası */}
      {isListening && (
        <span className="absolute inset-0 rounded-full animate-pulse-ring pointer-events-none" />
      )}

      {/* İçerik: state'e göre değişir */}
      {isProcessing ? (
        // Dönen spinner
        <div className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(255,165,0,0.15)", borderTopColor: "#ffa500" }} />
      ) : isSpeaking ? (
        // Ses dalgası barları
        <div className="flex items-end gap-[3px] h-6">
          {[12, 20, 16, 22, 14].map((h, i) => (
            <div key={i} className="soundwave-bar w-[3px] rounded-full"
              style={{ height: `${h}px`, background: "#00ff9d" }} />
          ))}
        </div>
      ) : (
        // Idle, passive, listening, off: mikrofon ikonu
        <MicIcon opacity={isOff ? 0.3 : 1} />
      )}
    </button>
  );
}

// ─── HUD köşe süsleri ─────────────────────────────────────────────────────────

function HudCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const size = 12;
  const c = "rgba(0,212,255,0.22)";
  const s: React.CSSProperties = {
    position: "absolute", width: size, height: size,
    borderColor: c, borderStyle: "solid", borderWidth: 0,
  };
  if (pos === "tl") { s.top = 0; s.left = 0; s.borderTopWidth = 1.5; s.borderLeftWidth = 1.5; }
  if (pos === "tr") { s.top = 0; s.right = 0; s.borderTopWidth = 1.5; s.borderRightWidth = 1.5; }
  if (pos === "bl") { s.bottom = 0; s.left = 0; s.borderBottomWidth = 1.5; s.borderLeftWidth = 1.5; }
  if (pos === "br") { s.bottom = 0; s.right = 0; s.borderBottomWidth = 1.5; s.borderRightWidth = 1.5; }
  return <span style={s} />;
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

// Her oturum için benzersiz ID (sayfa yenilenmeden sabit kalır)
const SESSION_ID = typeof crypto !== "undefined"
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2);

export default function VoiceChat() {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [status, setStatus]             = useState<AppStatus>("off");
  const [error, setError]               = useState<string | null>(null);
  const [hasSpeechAPI, setHasSpeechAPI] = useState(true);

  // Status ref — recognition callback'lerinde stale closure'ı önler
  const statusRef = useRef<AppStatus>("off");
  useEffect(() => { statusRef.current = status; }, [status]);

  // Messages ref — processAudio callback'inde güncel geçmiş için
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Web Speech API (wake word + stop command)
  const recognitionRef       = useRef<SpeechRecognition | null>(null);
  const wakeWordCooldownRef  = useRef(false);  // 5sn boyunca tekrar tetiklenmeyi engeller
  const recognitionAbortedRef = useRef(false); // Kasıtlı abort'ta onend'in restart etmesini önler

  // Refs: recognition callback'inden çağrılan fonksiyonlar için
  // (useCallback döngüsel bağımlılığını kırar)
  const startRecordingRef = useRef<() => void>(() => {});
  const stopAudioRef      = useRef<() => void>(() => {});

  // Kayıt (MediaRecorder + VAD)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const isRecordingRef   = useRef(false);

  // VAD
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef     = useRef<AnalyserNode | null>(null);
  const vadIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TTS
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Yeni mesaj gelince aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Component unmount: tüm kaynakları temizle
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      currentAudioRef.current?.pause();
      audioContextRef.current?.close();
      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // ── VAD temizleme ────────────────────────────────────────────────────────────

  const stopVAD = useCallback(() => {
    if (vadIntervalRef.current) { clearInterval(vadIntervalRef.current); vadIntervalRef.current = null; }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
  }, []);

  // ── Web Speech API kurulumu ───────────────────────────────────────────────────

  const setupRecognition = useCallback((): SpeechRecognition | null => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setHasSpeechAPI(false);
      return null;
    }

    const recognition = new SR();
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.lang            = "en-US"; // "Hey Victor" İngilizce komut — en-US ile mükemmel tanınır
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // En son utterance'ın TÜM alternatiflerini topla — "m.k" 1. olabilir, "victor" 3.
      const result        = event.results[event.results.length - 1];
      const alternatives: string[] = [];
      for (let i = 0; i < result.length; i++) {
        alternatives.push(result[i].transcript.toLowerCase().trim());
      }
      const s = statusRef.current;

      if (s === "passive" && !wakeWordCooldownRef.current) {
        // Herhangi bir alternatif wake word içeriyorsa tetikle
        const matched = alternatives.some((alt) =>
          WAKE_WORDS.some((w) => alt.includes(w))
        );
        if (matched) {
          wakeWordCooldownRef.current = true;
          setTimeout(() => { wakeWordCooldownRef.current = false; }, WAKE_WORD_COOLDOWN_MS);
          recognitionAbortedRef.current = true;
          recognitionRef.current?.abort();
          startRecordingRef.current();
        }
      } else if (s === "speaking") {
        // Stop komutu — herhangi bir alternatifte ara
        const stopMatched = alternatives.some((alt) =>
          STOP_COMMANDS.some((c) => alt.includes(c))
        );
        if (stopMatched) stopAudioRef.current();
      }
    };

    recognition.onend = () => {
      // Kasıtlı abort (wake word tetiklendi): restart etme
      if (recognitionAbortedRef.current) {
        recognitionAbortedRef.current = false;
        return;
      }
      // passive veya speaking: en-US ile yeniden başlat (wake word için)
      const s = statusRef.current;
      if (s === "passive" || s === "speaking") {
        setTimeout(() => {
          try { recognitionRef.current?.start(); } catch { /* zaten başlamış olabilir */ }
        }, 200);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // no-speech ve aborted beklenen hatalardır, loglama
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error("[WakeWord] Speech recognition hatası:", event.error);
      }
    };

    return recognition;
  }, []);

  // Recognition'ı başlat (passive dinleme — tr-TR, wake word listesi varyantları kapsar)
  const startPassiveListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = setupRecognition();
    }
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch { /* zaten başlamış */ }
  }, [setupRecognition]);

  // Recognition'ı durdur
  const stopPassiveListening = useCallback(() => {
    recognitionAbortedRef.current = true;
    try { recognitionRef.current?.abort(); } catch { /* yoksay */ }
  }, []);

  // ── OpenAI TTS ───────────────────────────────────────────────────────────────

  const speak = useCallback(async (text: string) => {
    try {
      setStatus("speaking");

      // Önceki sesi durdur
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Ses üretilemedi.");
      }

      const blob     = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio    = new Audio(audioUrl);
      audio.preload  = "auto";
      currentAudioRef.current = audio;

      // Stop komutu için recognition'ı başlat (zaten tr-TR)
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* zaten başlamış olabilir */ }
      }

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        setStatus("passive");
        // recognition zaten çalışıyor (onend restart'ı halledecek)
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        setStatus("passive");
      };

      await audio.play();
    } catch (err) {
      console.error("[TTS] Ses çalma hatası:", err);
      setStatus("passive");
    }
  }, []);

  // ── Sesi kes (stop komutu veya buton) ────────────────────────────────────────

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setStatus("passive");
    // Recognition passive modda zaten çalışıyor olmalı
  }, []);

  // stopAudio ref'ini güncelle (recognition callback'inde kullanılır)
  useEffect(() => { stopAudioRef.current = stopAudio; }, [stopAudio]);

  // ── Whisper + Claude (streaming) + TTS pipeline ──────────────────────────────

  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setStatus("processing");
      setError(null);

      // 1. Whisper: ses → metin
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", { method: "POST", body: formData });
      if (!transcribeRes.ok) {
        const err = await transcribeRes.json();
        throw new Error(err.error ?? "Ses yazıya çevrilemedi.");
      }

      const { text } = await transcribeRes.json();

      // Sessizlik kaydı — hiçbir şey söylenmemiş
      if (!text?.trim()) {
        setError("Ses alınamadı — sorunuzu söyledikten sonra 1-2 saniye bekleyin.");
        setStatus("error");
        setTimeout(() => {
          setError(null);
          setStatus("passive");
          startPassiveListening();
        }, 3000);
        return;
      }

      const userMsg: Message = { id: generateId(), role: "user", content: text, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);

      // 2. Claude: streaming cevap
      const history = messagesRef.current.map((m) => ({ role: m.role, content: m.content }));

      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, session_id: SESSION_ID }),
      });

      if (!chatRes.ok || !chatRes.body) {
        const err = await chatRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Victor cevap veremedi.");
      }

      // Stream'i oku, UI anlık güncelle
      const reader      = chatRes.body.getReader();
      const decoder     = new TextDecoder();
      let fullReply     = "";
      let bubbleCreated = false;
      const assistantMsgId = generateId();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullReply  += chunk;

        if (!bubbleCreated) {
          bubbleCreated = true;
          setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: fullReply, timestamp: new Date() }]);
        } else {
          setMessages((prev) => prev.map((m) => m.id === assistantMsgId ? { ...m, content: fullReply } : m));
        }
      }

      // 3. TTS — speak() içinde recognition restart edilir
      if (fullReply.trim()) {
        await speak(fullReply);
      } else {
        setStatus("passive");
        startPassiveListening();
      }
    } catch (err) {
      console.error("[VoiceChat] Pipeline hatası:", err);
      const msg = err instanceof Error ? err.message : "Bir hata oluştu.";
      setError(msg);
      setStatus("error");
      // 3sn sonra passive'e dön ve wake word dinlemeye devam et
      setTimeout(() => {
        setStatus("passive");
        startPassiveListening();
      }, 3000);
    }
  }, [speak, startPassiveListening]);

  // ── Kayıt durdur ─────────────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    stopVAD();
    mediaRecorderRef.current?.stop(); // onstop → processAudio
    mediaRecorderRef.current = null;
  }, [stopVAD]);

  // ── Kayıt başlat + VAD ────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return;
    try {
      // Ses çalıyorsa durdur
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        processAudio(new Blob(audioChunksRef.current, { type: "audio/webm" }));
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      isRecordingRef.current   = true;
      setStatus("listening");

      // Bip + titreşim: "kayıt başladı, şimdi konuş" sinyali
      playBeep();
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);

      // VAD: AudioContext ile sessizliği tespit et
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current     = analyser;

      const dataArray = new Uint8Array(analyser.fftSize);
      const recordingStartTime = Date.now();

      vadIntervalRef.current = setInterval(() => {
        if (!analyserRef.current) return;
        // İlk MIN_RECORDING_MS içinde VAD kayıtı durduramasın
        // (kullanıcının wake word'den sonra konuşmaya başlaması için süre tanı)
        if (Date.now() - recordingStartTime < MIN_RECORDING_MS) return;

        analyserRef.current.getByteTimeDomainData(dataArray);
        const rms = calcRMS(dataArray);

        if (rms < VAD_SILENCE_THRESHOLD) {
          // Sessizlik — timer henüz yoksa başlat
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => stopRecording(), VAD_SILENCE_DURATION);
          }
        } else {
          // Ses var — sessizlik timer'ını sıfırla
          if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        }
      }, VAD_POLL_INTERVAL);

    } catch {
      setError("Mikrofon erişimi reddedildi. Tarayıcı ayarlarından izin ver.");
      setStatus("error");
      setTimeout(() => {
        setStatus("passive");
        startPassiveListening();
      }, 3000);
    }
  }, [processAudio, stopRecording, startPassiveListening]);

  // startRecording ref'ini güncelle (recognition callback'inde kullanılır)
  useEffect(() => { startRecordingRef.current = startRecording; }, [startRecording]);

  // ── Sistem tamamen kapat ──────────────────────────────────────────────────────

  const stopSystem = useCallback(() => {
    stopPassiveListening();
    stopVAD();
    currentAudioRef.current?.pause();
    currentAudioRef.current = null;
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = null;
    }
    setMessages([]);
    setStatus("off");
    setError(null);
  }, [stopPassiveListening, stopVAD]);

  // ── Mikrofon buton tıklaması ──────────────────────────────────────────────────

  const handleMicClick = useCallback(() => {
    if (status === "off") {
      // Sistemi aç, wake word beklemeye geç
      setStatus("passive");
      startPassiveListening();
    } else if (status === "speaking") {
      // Sesi kes ama sistemi kapatma — passive'e dön
      stopAudio();
    } else if (status === "listening") {
      // Manuel kayıt iptali
      stopRecording();
      setStatus("passive");
      startPassiveListening();
    } else {
      // passive / processing / error → sistemi tamamen kapat
      stopSystem();
    }
  }, [status, startPassiveListening, stopAudio, stopRecording, stopSystem]);

  // Buton altı hint metni
  const hintText: Record<AppStatus, string> = {
    off:        "BAŞLATMAK İÇİN DOKUN",
    passive:    "\"HEY VICTOR\" — BİP DUYUNCA SORUNUZU SÖYLEYİN",
    listening:  "SESİNİZİ ALIYORUM...",
    processing: "DÜŞÜNÜYORUM...",
    speaking:   "\"SUS\" VEYA BUTONA DOKUN",
    error:      "TEKRAR DENENIYOR...",
  };

  return (
    <div className="flex flex-col h-full w-full max-w-xl mx-auto" style={{ background: "var(--background)" }}>

      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-4 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--accent-dim)", border: "1px solid var(--border-bright)", color: "var(--accent)" }}>
            <HudCorner pos="tl" /><HudCorner pos="tr" />
            <HudCorner pos="bl" /><HudCorner pos="br" />
            V
          </div>
          <div>
            <p className="text-white text-sm font-semibold tracking-wider">VICTOR</p>
            <p className="text-[10px] tracking-[0.15em]" style={{ color: "var(--text-secondary)" }}>
              KİŞİSEL AI ASISTAN
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatusLine status={status} />
          {messages.length > 0 && status !== "off" && (
            <button onClick={stopSystem}
              className="text-[10px] tracking-widest transition-colors touch-manipulation"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              aria-label="Sistemi kapat">
              KAPAT
            </button>
          )}
        </div>
      </header>

      {/* ── Tarayıcı uyarısı (SpeechRecognition yoksa) ── */}
      {!hasSpeechAPI && (
        <div className="px-4 py-2 text-[10px] text-center tracking-wide"
          style={{ background: "rgba(255,165,0,0.07)", borderBottom: "1px solid rgba(255,165,0,0.15)", color: "#ffa500" }}>
          Bu tarayıcıda wake word desteklenmiyor. Butona basarak konuşun. (Chrome önerilir)
        </div>
      )}

      {/* ── Kayıt başladı bildirimi ── */}
      {status === "listening" && (
        <div className="animate-fade-in-up mx-4 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.3)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: "#00d4ff" }} />
          <p className="text-sm font-medium" style={{ color: "#00d4ff" }}>
            Sorunuzu söyleyin — durunca gönderirim.
          </p>
          <span className="ml-auto text-[10px] opacity-50" style={{ color: "#00d4ff" }}>1.5sn sessizlik = gönder</span>
        </div>
      )}

      {/* ── Mesaj listesi ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-4 pb-8 select-none">
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--border-bright)", color: "var(--accent)" }}>
              <HudCorner pos="tl" /><HudCorner pos="tr" />
              <HudCorner pos="bl" /><HudCorner pos="br" />
              V
            </div>
            <div className="text-center space-y-1.5">
              {status === "off" ? (
                <>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Sistem kapalı.</p>
                  <p className="text-[10px] tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
                    BAŞLATMAK İÇİN BUTONA BAS
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Sistem hazır.</p>
                  <p className="text-[10px] tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
                    &ldquo;HEY VICTOR&rdquo; → BİP → SORUNUZU SÖYLEYİN
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}

        {error && (
          <div className="flex justify-center animate-fade-in-up">
            <p className="text-xs px-3 py-1.5 rounded-full text-center max-w-[90%]"
              style={{ color: "#ff6b6b", background: "rgba(255,68,68,0.07)", border: "1px solid rgba(255,68,68,0.15)" }}>
              {error}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Mikrofon alanı ── */}
      <div className="shrink-0 flex flex-col items-center gap-3 px-4 py-7"
        style={{ borderTop: "1px solid var(--border)" }}>
        <MicButton status={status} onClick={handleMicClick} />
        <p className="text-[10px] tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
          {hintText[status]}
        </p>

      </div>
    </div>
  );
}
