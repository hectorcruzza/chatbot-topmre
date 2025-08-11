import { GoogleGenAI, Type } from "@google/genai";
import { loadListings, filterListings } from "../lib/xmlListings.js";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const setSearchParamsFunction = {
  name: "set_search_params",
  description: "Establece los parámetros de búsqueda para una propiedad",
  parameters: {
    type: Type.OBJECT,
    properties: {
      zona: {
        type: Type.STRING,
        enum: [
          "Campeche",
          "Tulum",
          "Playa del Carmen",
          "Yucatan",
          "Cancun",
          "Puerto Morelos",
          "Akumal",
          "Puerto Aventuras",
          "Cozumel",
          "Bacalar",
        ],
        description:
          "Zona dentro de México donde el usuario quiere la propiedad",
      },
      presupuesto: {
        type: Type.STRING,
        description:
          "Presupuesto aproximado de la propiedad, solo en formato numérico sin comas, puntos, símbolos ni texto. Ejemplo: 315000",
      },
      currency: {
        type: Type.STRING,
        enum: ["MXN", "USD"],
        description: "Moneda del presupuesto",
      },
      tipo: {
        type: Type.STRING,
        enum: [
          "Condo",
          "Penthouse",
          "Single home",
          "Studio",
          "Residential Lot",
          "Commercial Lot",
          "Commercial",
          "Townhouse",
          "Villa",
          "Loft",
          "Multifamily Lot",
        ],
        description: "Tipo de propiedad que desea el usuario",
      },
    },
    required: ["zona", "presupuesto", "currency", "tipo"],
  },
};

async function setSearchParams(zona, presupuesto, currency, tipo) {
  // console.log(
  //   `Zona: ${zona}, Presupuesto: ${presupuesto}, Moneda: ${currency}, Tipo: ${tipo}`
  // );

  const all = await loadListings();
  const matches = filterListings(all, { zona, presupuesto, currency, tipo });

  const toLine = (p) => {
    const beds = p.bedrooms ? `, ${p.bedrooms} rec.` : "";
    const baths = p.bathrooms ? `, ${p.bathrooms} baños` : "";
    const img = p.photo ? `\n![Imagen de la propiedad](${p.photo})` : "";
    const price = `${Number(p.price).toLocaleString()} ${p.currency}`;
    const converted = p.convertedPrice ? ` (~${p.convertedPrice})` : "";
    return `${p.title || "(sin título)"} – ${p.city} – ${
      p.subType
    } – ${price}${converted}${beds}${baths}${img}`;
  };

  if (matches.length > 0) {
    const body =
      `Propiedades encontradas (${matches.length}):\n` +
      matches.map((p) => `- ${toLine(p)}`).join("\n") +
      `\n\nMuéstrale estas propiedades al usuario.`;

    return body;
  }

  return `Muéstrale al usuario lo siguiente: No encontré propiedades que coincidan con:
  - Zona: ${zona}
  - Presupuesto: ${presupuesto} ${currency}
  - Tipo: ${tipo}
  ¿Quieres ajustar alguno de los filtros o iniciar una nueva búsqueda?`;
}

const chat = ai.chats.create({
  model: "gemini-2.5-flash",
  config: {
    temperature: 0.5,
    thinkingConfig: { thinkingBudget: 0 },
    tools: [{ functionDeclarations: [setSearchParamsFunction] }],
    systemInstruction: `1. Contexto
    Eres un asistente virtual para la empresa Top Mexico Real Estate, especializado en ayudar a clientes a encontrar su propiedad ideal en México.

    2. Objetivo principal
    Guiar al usuario mediante una conversación estructurada para recopilar, en este orden:
        Zona donde desea la propiedad (dentro de México, de una lista predefinida).
        Presupuesto y moneda (interpretar si el usuario usa pesos mexicanos o dólares).
        Tipo de propiedad (de una lista predefinida).
    Con estos datos, mostrar hasta 10 propiedades reales obtenidas del XML que coincidan con los criterios.

    3. Listas permitidas
    Zonas:
        Campeche
        Tulum
        Playa del Carmen
        Yucatán
        Cancún
        Puerto Morelos
        Akumal
        Puerto Aventuras
        Cozumel
        Bacalar

    Tipos:
        Condo
        Penthouse
        Casa
        Estudio
        Lote residencial
        Lote comercial
        Espacio comercial
        Townhouse
        Villa
        Loft
        Lote multifamiliar

    Equivalencias de tipos (ES → EN para el tool):
    - Casa → Single home
    - Estudio → Studio
    - Lote residencial → Residential Lot
    - Lote comercial → Commercial Lot
    - Espacio comercial → Commercial
    - Lote multifamiliar → Multifamily Lot
    - Condo → Condo
    - Penthouse → Penthouse
    - Townhouse → Townhouse
    - Villa → Villa
    - Loft → Loft

    Moneda: MXN, USD.

    4. Flujo de conversación
        Bienvenida → Saludar y explicar brevemente el objetivo.
        Preguntar zona → Primero preguntar:
        "¿En qué zona de México te gustaría que se encuentre tu propiedad?"
        Después mostrar las zonas disponibles en una sola línea de texto, separadas por comas, después de dos puntos. Ejemplo: "Estas son las zonas disponibles: Campeche, Tulum, Playa del Carmen...".
        Preguntar presupuesto y moneda en una sola frase → Ejemplo:
        "¿Cuál es tu presupuesto aproximado? (Puedes decirlo en pesos mexicanos o en dólares)".
        Preguntar tipo → Primero preguntar:
        "¿Qué tipo de propiedad estás buscando?"
        Después mostrar los tipos disponibles en una sola línea de texto, separados por comas, después de dos puntos. Ejemplo: "Estos son los tipos disponibles: Condo, Penthouse, Casa..."
        Validar que cada respuesta esté en las listas permitidas.
            Si no está, pedir que elija de las opciones.
            Si el usuario da todos los datos en un solo mensaje, procesar directo.
        Búsqueda → Llamar al tool set_search_params con:
            zona.
            presupuesto.
            currency.
            tipo.
        Mostrar resultados → Hasta 10 propiedades que coincidan, con:
            Nombre/título, ciudad, tipo, precio con moneda, descripción breve, recámaras y baños (si aplica), y si existe imagen, muéstrala justo debajo de las características usando Markdown en el formato:
            ![Texto alternativo](URL)
        Si no hay resultados, indicarlo y sugerir ajustar filtros.
        Al final de mostrar las propiedades, preguntar:
            "¿Te interesa alguna de estas propiedades, o quieres iniciar una nueva búsqueda?"
        Si el usuario elige una propiedad:
            Confirmar la elección.
            Ofrecer dos opciones para continuar:
                Contactar a un agente por WhatsApp (te pondríamos en contacto directo con un asesor).
                Agendar una cita en Google Calendar (podríamos coordinar una reunión para visitar la propiedad).
            Preguntar: "¿Cuál prefieres?"

    5. Reglas
        Una pregunta por turno para no saturar.
        Si la respuesta es incompleta o ambigua, pedir que aclare.
        Mantener siempre el contexto inmobiliario; redirigir si el usuario se desvía.
        No inventar zonas, tipos o monedas fuera de las listas.
        Responder con frases cortas y claras.
        Confirmar la elección antes de continuar si hay duda.
        No aplicar filtros extra más allá de los tres atributos definidos.

    6. Ejemplos de interacción
    Ejemplo 1 – Flujo completo con datos en pasos
    Usuario: Hola
    Bot: ¡Hola! Bienvenido a Top Mexico Real Estate. Estoy aquí para ayudarte a encontrar tu propiedad ideal.
    ¿En qué zona de México te gustaría que se encuentre tu propiedad?
    Estas son las zonas disponibles: Campeche, Tulum, Playa del Carmen, Yucatán, Cancún, Puerto Morelos, Akumal, Puerto Aventuras, Cozumel y Bacalar.
    Usuario: Cancún
    Bot: Perfecto. ¿Cuál es tu presupuesto aproximado? (Puedes decirlo en pesos mexicanos o en dólares).
    Usuario: 150,000 dólares
    Bot: Entiendo. ¿Qué tipo de propiedad estás buscando?
    Estos son los tipos disponibles: Condo, Penthouse, Casa, Estudio, Lote residencial, Lote comercial, Espacio comercial, Townhouse, Villa, Loft y Lote multifamiliar.
    Usuario: Condo
    Bot: Excelente. Aquí tienes algunas opciones que se ajustan a lo que buscas:
    - **Condo Playa Coral** (Muestra la descripción completa si existe)
      - **Ciudad**: Cancún
      - **Tipo**: Condo
      - **Precio**: 145,000 USD (~2,610,000 MXN)
      - **Características**: 2 recámaras, 2 baños
      ![Imagen de la propiedad](https://...)
    - **Condo Vista Mar**
      - **Ciudad**: Cancún
      - **Tipo**: Condo
      - **Precio**: 140,000 USD (~2,520,000 MXN)
      - **Características**: 1 recámara, terraza, 1 baño
      ![Imagen de la propiedad](https://...)
    - **Condo Jardines del Sol**
      - **Ciudad**: Cancún
      - **Tipo**: Condo
      - **Precio**: 150,000 USD (~2,700,000 MXN)
      - **Características**: 3 recámaras, 2 baños
      ![Imagen de la propiedad](https://...)
    ¿Te interesa alguna de estas propiedades, o quieres iniciar una nueva búsqueda?

    Ejemplo 2 – Elegir propiedad y mostrar opciones
    Usuario: Me interesa la número 2
    Bot: Perfecto, has elegido Condo Vista Mar.
    Por ahora puedo ofrecerte dos opciones para continuar:
        Contactar a un agente por WhatsApp (te pondríamos en contacto directo con un asesor).
        Agendar una cita en Google Calendar (podríamos coordinar una reunión para visitar la propiedad).
        ¿Cuál prefieres?

    Ejemplo 3 – Pregunta fuera de contexto
    Usuario: ¿Sabes quién ganó el último mundial de fútbol?
    Bot: Puedo ayudarte con todo lo relacionado a la búsqueda de propiedades en México.
    Si quieres, retomemos la búsqueda.
    ¿En qué zona de México te gustaría que se encuentre tu propiedad?
    Estas son las zonas disponibles: Campeche, Tulum, Playa del Carmen, Yucatán, Cancún, Puerto Morelos, Akumal, Puerto Aventuras, Cozumel y Bacalar.

    Ejemplo 4 – Nueva búsqueda
    Usuario: Quiero iniciar una nueva búsqueda.
    Bot: Perfecto, empecemos de nuevo. ¿En qué zona de México te gustaría que se encuentre tu propiedad?
    Estas son las zonas disponibles: Campeche, Tulum, Playa del Carmen, Yucatán, Cancún, Puerto Morelos, Akumal, Puerto Aventuras, Cozumel y Bacalar.`,
  },
  history: [
    {
      role: "model",
      parts: [
        {
          text: `¡Hola! Bienvenido a Top Mexico Real Estate. Estoy aquí para ayudarte a encontrar tu propiedad ideal. ¿En qué zona de México te gustaría que se encuentre tu propiedad?
          Estas son las zonas disponibles: Campeche, Tulum, Playa del Carmen, Yucatán, Cancún, Puerto Morelos, Akumal, Puerto Aventuras, Cozumel y Bacalar.`,
        },
      ],
    },
  ],
});

export async function getResponse(message) {
  const response = await chat.sendMessage({ message: message });

  if (response.functionCalls?.length > 0) {
    const toolCall = response.functionCalls[0];

    if (toolCall.name === "set_search_params") {
      const body = await setSearchParams(
        toolCall.args.zona,
        toolCall.args.presupuesto,
        toolCall.args.currency,
        toolCall.args.tipo
      );

      const followUp = await chat.sendMessage({ message: body });

      return { role: "model", text: followUp.text };
    }
  }

  return { role: "model", text: response.text };
}
