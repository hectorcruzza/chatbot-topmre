import { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { getResponse } from "../config/gemini";

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "¡Hola! Bienvenido a Top Mexico Real Estate. Estoy aquí para ayudarte a encontrar tu propiedad ideal. Para comenzar, ¿en qué zona de México te gustaría que se encuentre tu propiedad?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (userText) => {
    if (!userText.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    try {
      const botMessage = await getResponse(userText);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `Error: ${error.message || "No se pudo obtener respuesta"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-screen w-full 
             md:bottom-24 md:right-6 md:left-auto md:w-96 
             bg-white rounded-none md:rounded-lg shadow-lg 
             flex flex-col overflow-hidden md:h-[500px]"
    >
      <ChatHeader onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-3 bg-[#f9e0e1]">
        <ChatMessages messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
