// utils/speechOrchestrator.ts
export interface SpeechJob {
  text: string;
  voice?: string;
  onSubtitles?: (chunk: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const enqueueSpeech = async ({
  avatar,
  text,
  onStart,
  onEnd,
  onSubtitles,
}: {
  avatar: any;
  text: string;
  onStart?: () => void;
  onEnd?: () => void;
  onSubtitles?: (word: string) => void;
}) => {
  if (!avatar || !text) {
    console.warn("❌ Missing avatar or text in enqueueSpeech");
    return;
  }

  const processed = avatar.lipsyncPreProcessText(text, "en");
  const lipsync = avatar.lipsyncWordsToVisemes(processed, "en");

  const words = processed.split(" ");
  const wordInterval = 200;

  const r: any = {
    words,
    wtimes: words.map((_: any, i: any) => i * wordInterval),
    wdurations: words.map(() => wordInterval),
    visemes: lipsync.visemes,
    vtimes: lipsync.times.map((t: any) => t * wordInterval),
    vdurations: lipsync.durations.map((d: any) => d * wordInterval),
  };

  const audioStartDelay = 250;

  r.vtimes = r.vtimes.map((t: any) => t + audioStartDelay);
  r.wtimes = r.wtimes.map((t: any) => t + audioStartDelay);

  try {
    const res = await fetch("/api/voice/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: "heart" }),
    });

    if (!res.ok) throw new Error("TTS API failed");

    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await avatar.audioCtx.decodeAudioData(arrayBuffer);

    r.audio = audioBuffer;

    console.log("✅ Audio loaded and decoded");
  } catch (err) {
    console.error("🧨 Audio fetch/decode error:", err);
  }

  console.log("🧠 Processed Text:", processed);
  console.log("🎭 Visemes:", lipsync);
  console.log("🎙️ Final Speech Job:", r);

  avatar.speakAudio(r, {}, onSubtitles);

  if (!avatar.isSpeaking) {
    avatar.startSpeaking();
  }

  if (onStart) onStart();

  if (r.audio) {
    const audioDuration = r.audio.duration * 1000; // in ms
    setTimeout(() => {
      if (onEnd) onEnd();
    }, audioDuration + 300); // add slight buffer
  }
};
