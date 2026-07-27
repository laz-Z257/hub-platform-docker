"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="flex items-center bg-white border-t border-gray-200 px-3 py-2.5 gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Escribe tu mensaje..."
        className="flex-1 h-12 bg-[#F5F5F5] rounded-full px-5 text-[15px] text-[#333] outline-none"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="w-12 h-12 rounded-full flex items-center justify-center disabled:bg-gray-300 bg-[#201A7A] transition-colors"
      >
        <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
      </button>
    </div>
  );
}
