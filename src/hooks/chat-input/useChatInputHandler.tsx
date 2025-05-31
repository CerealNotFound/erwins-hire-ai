import { useState } from "react";

export const useChatInputHandler = ({
  sendMessageHandler, // passes userText -> returns responseText
}: {
  sendMessageHandler: (userText: string) => Promise<string | undefined>;
  setValue: (val: string) => void;
}) => {
  const [value, setLocalValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!value.trim()) return;

    setIsLoading(true);

    const userText = value.trim();
    setLocalValue("");

    try {
      const response = await sendMessageHandler(userText);

      if (response) {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: userText,
            response,
          }),
        });
      }
    } catch (err) {
      console.error("Chat submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    value,
    setValue: setLocalValue,
    isLoading,
    handleTextChange,
    handleKeyDown,
    handleSubmit,
  };
};
