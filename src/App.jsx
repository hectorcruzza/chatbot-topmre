import { useState } from "react";
import ChatToggleButton from "./components/ChatToggleButton";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}

      {(!isOpen || window.innerWidth >= 768) && (
        <ChatToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      )}
    </>
  );
}
