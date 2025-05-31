import { useState } from "react";
import { AudioVisualizer } from "@/components/ui/audio-visualizer";
import { Button } from "@/components/ui/button";
import { ArrowUp, Mic, Sparkles, StopCircle } from "lucide-react";
import { useRef } from "react";
import { useAutosizeTextArea } from "@/hooks/chat-input/use-auto-size-textarea";
import { useAudioRecorder } from "@/hooks/chat-input/useAudioRecorder";

export const SearchInput = ({
  searchHandler,
  isLoading,
}: {
  searchHandler: (
    query: string,
    filters?: {
      min_experience?: number;
      max_experience?: number;
      required_skills?: string[];
      location?: string;
    }
  ) => Promise<any>;
  isLoading: boolean;
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null!);

  const [value, setValue] = useState("");
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!value.trim()) return;
    await searchHandler(value);
    setValue(""); // Optional: Clear input
  };

  const { isRecording, toggleRecording, isTranscribing, stream } =
    useAudioRecorder(
      setValue, // transcript goes into chat input
      searchHandler // send immediately if "send now"
    );

  useAutosizeTextArea({
    ref: textAreaRef,
    maxHeight: 200,
    borderWidth: 1,
    dependencies: [value],
  });

  return (
    <div className="flex flex-col w-full items-center gap-2">
      <div className="flex flex-1 w-full">
        {isRecording ? (
          <div className="w-full h-24 mt-2 rounded-md border bg-black">
            <AudioVisualizer
              stream={stream}
              isRecording={isRecording}
              onClick={toggleRecording}
            />
          </div>
        ) : (
          <textarea
            ref={textAreaRef}
            value={value}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe the candidate you're looking for..."
            className="w-full overflow-y-auto resize-none rounded-lg border bg-accent px-4 py-3 text-sm focus:outline-none focus:ring-primary"
          />
        )}
      </div>

      <div className="flex justify-between w-full shrink-0 gap-2">
        <div>
          {isTranscribing && (
            <div className="text-sm text-muted-foreground italic animate-pulse">
              Transcribing voice...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="lg"
            type="submit"
            className="flex items-center justify-center disabled:opacity-100"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <Sparkles className="h-8 w-8 animate-pulse" />
            ) : (
              <ArrowUp className="h-8 w-8" />
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="flex items-center justify-center"
            onClick={toggleRecording}
          >
            {isRecording ? (
              <StopCircle color="#f56565" className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
