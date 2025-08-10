import { useState } from "react";

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center p-2 border-t bg-white">
      <textarea
        className="flex-1 resize-none border rounded-lg p-2 text-sm focus:outline-none"
        rows="1"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Escribe un mensaje..."
        disabled={isLoading}
      />
      <button
        onClick={handleSend}
        disabled={isLoading}
        className="ml-2 bg-[#e1454b] hover:bg-[#e98b8f] text-white p-2 rounded-lg transition-all"
      >
        Enviar
      </button>
    </div>
  );
}
