import { GoogleGenAI, Type } from "@google/genai";
import { JewelryDetails } from "../types";

// Initialize Gemini API
// API Key is automatically handled via process.env.GEMINI_API_KEY as defined in vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Analyzes a jewelry image using Gemini 3 Flash.
 * Optimized for visual feature extraction and cataloging.
 */
export async function analyzeJewelry(imageBase64: string): Promise<JewelryDetails> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Configure it in the project settings.");
  }

  // Pure base64 data extraction
  const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  const mimeType = imageBase64.includes(";") ? imageBase64.split(";")[0].split(":")[1] : "image/jpeg";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Act as a master jeweler and gemologist. Analyze this jewelry piece. 
            Identify:
            1. The primary metal (e.g., 18K Yellow Gold, Platinum).
            2. Any gemstones present (e.g., Diamond, Ruby).
            3. The cut of the primary stone (e.g., Emerald cut, Pear cut).
            4. The overall style (e.g., Art Deco, Minimalist).
            5. A highly descriptive 'Artist Note' that describes the light behavior, refractions, and texture for a photographer's prompt.`,
          },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metal: { type: Type.STRING },
          stones: { type: Type.ARRAY, items: { type: Type.STRING } },
          cut: { type: Type.STRING },
          style: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["metal", "stones", "cut", "style", "description"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("The visual engine failed to return a valid analysis.");

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Analysis Parse Error:", text);
    throw new Error("Failed to parse the visual analysis report.");
  }
}

/**
 * Generates a high-quality jewelry marketing asset using Gemini 2.5 Flash Image.
 */
export async function generateJewelryImage(
  details: JewelryDetails,
  type: 'Macro' | 'Catalog' | 'Lifestyle' | 'Model',
  sourceBase64: string,
  variation: number = 1
): Promise<string> {
  const base64Data = sourceBase64.includes(",") ? sourceBase64.split(",")[1] : sourceBase64;
  const mimeType = sourceBase64.includes(";") ? sourceBase64.split(";")[0].split(":")[1] : "image/jpeg";

  const prompts = {
    Macro: [
      `Extreme macro photography of this jewelry piece: ${details.description}. High-end commercial jewelry photography, focus on stone scintillation and metal polish. 8K UHD, ultra-sharp focus, bokeh background.`,
      `Artistic close-up of ${details.description} showing intricate metal textures and light refraction. Moody split lighting, cinematic atmosphere, 8K resolution.`
    ],
    Catalog: [
      `Professional catalog product shot of ${details.description}. Perfectly centered on a clean, reflective luxury neutral studio background. 8K resolution, sharp details, commercial digital photography.`,
      `Minimalist catalog shot of ${details.description} on a soft textured silk background. Elegant shadows, high-end design aesthetic, extremely sharp focus, 8K.`
    ],
    Lifestyle: [
      `Luxury lifestyle photography of ${details.description}. Elegantly placed on a soft marble surface with soft natural window light. Cinematic atmosphere, shallow depth of field, 8K.`,
      `Moody lifestyle capture of ${details.description} amidst premium velvet textures and dark warm wood. Sophisticated evening lighting, luxury feel, 8K ultra high fidelity.`
    ],
    Model: [
      `Editorial fashion portrait of a hand or neck wearing ${details.description}. Focus on the jewelry detail, high-end aesthetic, realistic skin texture, 8K UHD.`,
      `Lifestyle fashion shot of a person elegantly wearing ${details.description} in a high-end luxury setting. Natural movement, sophisticated atmosphere, realistic details, 8K.`
    ]
  };

  // Select the prompt based on variation (1 or 2)
  const selectedPrompt = prompts[type][variation === 1 ? 0 : 1] || prompts[type][0];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { text: selectedPrompt },
        { inlineData: { mimeType, data: base64Data } },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  // Search for the image part in candidates
  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("No candidates received from the imagery engine.");

  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error(`The imagery engine failed to generate the '${type}' asset.`);
}
