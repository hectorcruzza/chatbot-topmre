export default function ChatHeader({ onClose }) {
  return (
    <div className="bg-[#e1454b] text-white p-3 flex justify-between items-center">
      <span className="font-semibold">Asistente Inmobiliario</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 text-lg"
      >
        Cerrar
      </button>
    </div>
  );
}
