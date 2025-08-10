import ReactMarkdown from "react-markdown";

export default function ChatMessages({ messages, isLoading }) {
  return (
    <div className="flex-1 overflow-y-auto p-3 bg-[#f9e0e1] space-y-3">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-2 rounded-lg max-w-[80%] ${
            msg.role === "user"
              ? "bg-[#e98b8f] text-white ml-auto"
              : "bg-white text-gray-800 mr-auto"
          }`}
        >
          <div className="whitespace-pre-line">
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="bg-white text-gray-500 p-2 rounded-lg mr-auto italic">
          Escribiendo...
        </div>
      )}
    </div>
  );
}
