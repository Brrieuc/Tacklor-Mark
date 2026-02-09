import { GoogleGenAI, Type } from "@google/genai";
import { CatchAnalysis, Language } from "../types";

// Fonction utilitaire pour récupérer la clé API sans faire planter l'application
// si 'process' n'est pas défini (cas fréquent sur Vercel/Vite côté navigateur)
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("Environnement process.env non détecté, utilisation de la clé vide.");
  }
  return '';
};

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: getApiKey() });

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeCatchImage = async (file: File, lang: Language = 'fr'): Promise<CatchAnalysis> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("No API KEY found. Returning mock data.");
    // Simulate delay for mock
    await new Promise(r => setTimeout(r, 2000));
    return {
      species: lang === 'fr' ? "Bar Européen" : "European Bass",
      length_cm: 52,
      weight_kg: 2.1,
      is_sensitive_species: false,
      technique: lang === 'fr' ? "Leurre de surface" : "Topwater Lure",
      spot_type: lang === 'fr' ? "Côte rocheuse" : "Rocky Coast"
    };
  }

  try {
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
      Analyze this image of a fish catch. 
      1. Identify the species (provide the common name in ${lang === 'fr' ? 'French' : 'English'}).
      2. Estimate its length in centimeters and weight in kilograms.
      3. Determine if it is a sensitive/protected species (RecFishing context).
      4. Infer the likely fishing technique used based on visible lures, rods, or context (e.g., Spinning, Surfcasting, Fly).
      5. Identify the type of spot/environment visible in the background (e.g., Open Sea, River Bank, Rocky Coast).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            species: { type: Type.STRING, description: `Common name of the fish species in ${lang}` },
            length_cm: { type: Type.NUMBER, description: "Estimated length in centimeters" },
            weight_kg: { type: Type.NUMBER, description: "Estimated weight in kilograms" },
            is_sensitive_species: { type: Type.BOOLEAN, description: "True if the species is sensitive/protected" },
            technique: { type: Type.STRING, description: `Inferred fishing technique in ${lang}` },
            spot_type: { type: Type.STRING, description: `Inferred spot type in ${lang}` }
          },
          required: ["species", "length_cm", "weight_kg", "is_sensitive_species"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as CatchAnalysis;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback or re-throw
    throw error;
  }
};