import { useState, useEffect, useRef } from "react";
import { enqueueSpeech } from "./speech-orchestrator";

export const ensureAudioContextResumed = async (avatar: any) => {
  let audioContext: AudioContext | null = avatar.audioCtx;
  console.log("🔊 Ensuring AudioContext is ready");

  if (!audioContext) {
    audioContext = new AudioContext();
    avatar.audioCtx = audioContext;
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
    console.log("🔊 AudioContext resumed");
  }

  console.log("🔊 AudioContext state:", audioContext.state);
  return audioContext;
};

interface SimpleVoiceEngineProps {
  avatar: any;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export function useSimpleVoiceEngine({
  avatar,
  onSpeechStart,
  onSpeechEnd,
}: SimpleVoiceEngineProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string>("");
  
  // Use ref to persist across re-renders and hot reloads
  const isAudioInitializedRef = useRef(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Initialize audio context - MUST be called from user interaction
  const initializeAudio = async (): Promise<boolean> => {
    if (!avatar) {
      console.error("❌ No avatar available for audio initialization");
      return false;
    }

    // Check if already initialized via ref
    if (isAudioInitializedRef.current) {
      console.log("🎵 Audio already initialized (via ref)");
      setIsAudioInitialized(true);
      return true;
    }

    try {
      console.log("🎵 Initializing audio context...");
      await ensureAudioContextResumed(avatar);

      // Test with a short silent audio to ensure everything works
      await speakMessage("Preparing myself.", true);

      // Set both state and ref
      isAudioInitializedRef.current = true;
      setIsAudioInitialized(true);
      console.log("✅ Audio initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Audio initialization failed:", error);
      return false;
    }
  };

  // Core speaking function
  const speakMessage = async (
    text: string,
    isTest: boolean = false
  ): Promise<void> => {
    if (!text.trim() || !avatar) {
      console.warn("⚠️ Cannot speak: missing text or avatar");
      return;
    }

    // Check BOTH state and ref for initialization
    const audioReady = isTest || isAudioInitialized || isAudioInitializedRef.current;
    
    if (!audioReady) {
      console.error("❌ Audio not initialized. Call initializeAudio() first!");
      return;
    }

    console.log("🔊 Speaking:", text);
    setCurrentlySpeaking(text);
    setIsSpeaking(true);
    onSpeechStart?.();

    try {
      await ensureAudioContextResumed(avatar);

      return new Promise<void>((resolve, reject) => {
        enqueueSpeech({
          avatar,
          text: text.trim(),
          onStart: () => {
            console.log("🔊 Avatar started speaking:", text);
            avatar?.startSpeaking?.();
          },
          onEnd: () => {
            console.log("🔇 Avatar finished speaking:", text);
            avatar?.stopSpeaking?.();
            setIsSpeaking(false);
            setCurrentlySpeaking("");
            onSpeechEnd?.();
            resolve();
          },
          onSubtitles: (word: any) => {
            console.log("📝 Subtitle:", word);
          },
        });
      });
    } catch (error) {
      console.error("❌ Failed to speak message:", error);
      setIsSpeaking(false);
      setCurrentlySpeaking("");
      throw error;
    }
  };

  // Stop current speech
  const stopSpeaking = () => {
    if (avatar && isSpeaking) {
      console.log("⏹️ Stopping speech");
      avatar.stopSpeaking?.();
      setIsSpeaking(false);
      setCurrentlySpeaking("");
    }
  };

  // Speak multiple messages in sequence
  const speakSequence = async (messages: string[]): Promise<void> => {
    for (const message of messages) {
      await speakMessage(message);
    }
  };

  // Sync state with ref on avatar changes
  useEffect(() => {
    if (avatar) {
      console.log("✅ Avatar ready in SimpleVoiceEngine", {
        hasStartSpeaking: typeof avatar.startSpeaking,
        hasStopSpeaking: typeof avatar.stopSpeaking,
        hasAudioCtx: !!avatar.audioCtx,
        audioInitializedRef: isAudioInitializedRef.current,
        audioInitializedState: isAudioInitialized,
      });
      
      // If ref shows initialized but state doesn't, sync them
      if (isAudioInitializedRef.current && !isAudioInitialized) {
        console.log("🔄 Syncing audio initialization state");
        setIsAudioInitialized(true);
      }
    }
  }, [avatar, isAudioInitialized]);

  return {
    // Core functions
    initializeAudio,
    speakMessage,
    stopSpeaking,
    speakSequence,

    // State
    isSpeaking,
    isAudioInitialized: isAudioInitialized || isAudioInitializedRef.current,
    currentlySpeaking,
    isAvatarReady: Boolean(avatar),

    // Debug
    audioContextState: avatar?.audioCtx?.state || "not-created",
  };
}