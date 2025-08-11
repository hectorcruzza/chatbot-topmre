import { useState } from "react";
import ChatToggleButton from "./components/ChatToggleButton";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: `¡Hola! Bienvenido a Top Mexico Real Estate. Estoy aquí para ayudarte a encontrar tu propiedad ideal. ¿En qué zona de México te gustaría que se encuentre tu propiedad?
      Estas son las zonas disponibles: Campeche, Tulum, Playa del Carmen, Yucatán, Cancún, Puerto Morelos, Akumal, Puerto Aventuras, Cozumel y Bacalar.`,
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
