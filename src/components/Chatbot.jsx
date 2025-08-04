import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const body = {
      contents: [{ parts: [{ text: input }] }],
    };

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const reply = data.candidates[0].content.parts[0].text;
    const botMessage = { sender: "bot", text: reply };
    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div className="fixed bottom-6 right-6">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#e1454b] flex items-center justify-center shadow-lg"
        >
          <img src="/chat.png" alt="Chatbot" className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-[#e1454b] text-white p-4 font-semibold text-lg flex justify-between items-center">
            Hola, bienvenido.
            <button
              onClick={() => setIsOpen(false)}
              className="text-white text-xl"
            >
              Cerrar
            </button>
          </div>
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-[#e1454b] text-white ml-auto"
                    : "bg-gray-200 text-black"
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-[#e1454b] text-white px-4 rounded-r-md"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
