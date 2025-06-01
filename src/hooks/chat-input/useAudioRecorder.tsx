import { useState, useRef } from "react";
import { toast } from "sonner";

export function useAudioRecorder(
  setTranscript: (text: string) => void,
  onAnswerRecieved: (text: string) => void,
  isInterview: boolean = false
) {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const mediaRecorder = new MediaRecorder(mediaStream);
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
      const formData = new FormData();
      formData.append("audioFile", audioBlob);

      setIsTranscribing(true);
      const res = await fetch("/api/voice/stt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const transcript = data?.text;
      if (transcript) {
        // toast.success("Voice input detected");
        console.log(transcript);

        if (isInterview) {
          setTranscript(transcript);
          onAnswerRecieved(transcript);
        } else {
          if (transcript.toLowerCase().includes("send now")) {
            toast.success("Sending message via voice command...");
            setTranscript("");
            onAnswerRecieved(transcript.replace(/send now/i, "").trim());
          } else {
            setTranscript(transcript); // just fill in textarea
          }
        }
      }

      setStream(null);
      setIsRecording(false);
      setIsTranscribing(false);
    };

    mediaRecorderRef.current = mediaRecorder;
    setStream(mediaStream);
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    stream?.getTracks().forEach((track) => track.stop());
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return { isRecording, stream, toggleRecording, isTranscribing };
}
