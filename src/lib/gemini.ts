import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from './systemPrompt';

let ai: GoogleGenAI | null = null;

export const getGemini = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("La clave API de Gemini no está configurada. Por favor, añádela en el panel de 'Secrets' (Configuración) de la aplicación, o en tu archivo de entorno .env.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

export async function generateAssetsImage(prompt: string): Promise<string | null> {
  const gemini = getGemini();
  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (err: any) {
    console.error("Image Generation API Error:", err);
    const errorString = err instanceof Error ? err.message : String(err);
    if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('exceeded your current quota')) {
      alert("Has excedido tu cuota de uso de la API de Gemini para la generación de imágenes (Error 429). Por favor, intenta de nuevo más tarde.");
    }
    return null;
  }
}

export async function runAITool(intent: string, input: string) {
  const gemini = getGemini();
  const prompt = `INSTRUCCIÓN DE USUARIO: Necesito usar la herramienta con intención '${intent}'.\n\nDATOS PROPORCIONADOS:\n${input}\n\n${(intent === 'business_search') ? 'IMPORTANTE: DEBES USAR LA HERRAMIENTA DE BÚSQUEDA DE GOOGLE (googleSearch) para buscar en la web en tiempo real y encontrar negocios y datos reales. NUNCA inventes información. Solo devuelve información confirmada por los resultados de búsqueda.\n\n' : ''}Por favor, devuelve UNICAMENTE el JSON correspondiente. Usa las definiciones y esquemas establecidos para '${intent}'.`;

  try {
    const config: any = {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.2, // Low temperature for high precision and compliance to instructions.
    };

    // Use JSON mode for content generation, but standard mode for intents that need web search
    // because googleSearch and responseMimeType='application/json' are sometimes incompatible.
    if (intent === 'business_search') {
      config.tools = [{ googleSearch: {} }];
    } else {
      config.responseMimeType = 'application/json';
    }

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config
    });

    const text = response.text;
    
    if (!text) {
        throw new Error("La IA no devolvió ninguna respuesta.");
    }

    try {
      // Find the first { or [ and last } or ] to extract JSON from potentially mixed responses
      const startMatch = text.match(/[{\[]/);
      const endMatch = text.match(/[}\]](?!.*[}\]])/s);
      
      if (!startMatch || !endMatch) {
        throw new Error("No JSON found in response");
      }
      
      const startIndex = startMatch.index!;
      const endIndex = endMatch.index!;
      
      const jsonStr = text.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonStr);
    } catch(e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("No se pudo procesar la respuesta de la IA. Por favor, intenta de nuevo.");
    }
  } catch (err: any) {
    console.error("API Error:", err);
    const errorString = err instanceof Error ? err.message : String(err);
    if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('exceeded your current quota')) {
      throw new Error("Has excedido tu cuota de uso de la API de Gemini (Error 429). Por favor, intenta de nuevo más tarde o verifica los límites de tu plan.");
    }
    throw new Error(errorString || "Se produjo un error de conexión con la IA.");
  }
}
