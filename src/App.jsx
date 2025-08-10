import { useState } from "react";
import ChatToggleButton from "./components/ChatToggleButton";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "¡Hola! Bienvenido a Top Mexico Real Estate. Estoy aquí para ayudarte a encontrar tu propiedad ideal. Para comenzar, ¿en qué zona de México te gustaría que se encuentre tu propiedad?",
    },
  ]);

  return (
    <>
      {isOpen && (
        <ChatWindow
          onClose={() => setIsOpen(false)}
          messages={messages}
          setMessages={setMessages}
        />
      )}

      {(!isOpen || window.innerWidth >= 768) && (
        <ChatToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      )}
    </>
  );
}
