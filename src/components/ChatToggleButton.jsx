export default function ChatToggleButton({ isOpen, onClick }) {
  const iconSrc = isOpen ? "/images/close-icon.png" : "/images/chat-icon.png";
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all
                 bg-[#e1454b] hover:bg-[#e98b8f] focus:outline-none"
      aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
    >
      <img src={iconSrc} alt="Imagen" className="h-6 w-6" />
    </button>
  );
}
