import { useEffect } from "react";
import { getResponse } from "./gemini/gemini";

export default function App() {
  const fetchResponse = async () => {
    const message = "Hola, quiero buscar una propiedad.";
    await getResponse(message);
  };

  useEffect(() => {
    fetchResponse();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold">Chatbot</h1>
    </>
  );
}
