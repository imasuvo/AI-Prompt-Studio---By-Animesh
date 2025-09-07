import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { STORYBOARD_SCHEMA, VEO_STORYBOARD_SYSTEM_PROMPT, GIF_STORYBOARD_SYSTEM_PROMPT, GIF_STORYBOARD_SCHEMA } from '../constants';
import { ApiAspectRatio } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development, but the environment must have the key.
  console.warn("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * A centralized error handler for all Gemini API calls.
 * It checks for specific, known errors like quota exhaustion and provides user-friendly messages.
 * @param error The error object caught from the API call.
 * @param context A string describing the operation that failed (e.g., "generate image").
 * @throws {Error} Throws a new, user-friendly error.
 */
const handleApiError = (error: any, context: string): never => {
  console.error(`Error during ${context}:`, error);

  // Convert the error to a string to reliably check for keywords.
  // The error could be an Error object, a string (like stringified JSON), or another object.
  const errorString = (error instanceof Error) ? error.message : String(error);

  if (errorString.includes('429') && errorString.includes('RESOURCE_EXHAUSTED')) {
    let detailedMessage = "You have exceeded your current quota.";
    try {
      // The error message from the SDK often contains or is a JSON string.
      // We find the start of the JSON to parse it.
      const jsonStart = errorString.indexOf('{');
      if (jsonStart !== -1) {
        const jsonString = errorString.substring(jsonStart);
        const errorJson = JSON.parse(jsonString);
        detailedMessage = errorJson?.error?.message || detailedMessage;
      }
    } catch (e) {
      // Parsing failed, but we still know it's a quota issue. Use a generic quota message.
      console.warn("Could not parse detailed quota error message, using generic message.", e);
    }
    throw new Error(`API Limit Reached: ${detailedMessage} Please check your plan and billing details or try again later.`);
  }

  // Generic fallback for other API or network errors.
  throw new Error(`Failed to ${context}. An unexpected error occurred. Please check the console for details.`);
};


export const generateTextPrompt = async (systemInstruction: string, userInput: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userInput,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    if (!response.text) {
        const blockReason = response?.candidates?.[0]?.finishReason;
        if (blockReason === 'SAFETY') {
            throw new Error("Content was blocked due to safety reasons. Please adjust your prompt.");
        }
        throw new Error("Failed to generate prompt from AI. The model returned an empty response.");
    }

    return response.text;
  } catch (error) {
    handleApiError(error, 'generate text prompt');
  }
};

export const generateStoryboardPrompts = async (cinematicPrompt: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: cinematicPrompt,
      config: {
        systemInstruction: VEO_STORYBOARD_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: STORYBOARD_SCHEMA,
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
        const blockReason = response?.candidates?.[0]?.finishReason;
        if (blockReason === 'SAFETY') {
            throw new Error("Content was blocked due to safety reasons. Please adjust your prompt.");
        }
        throw new Error("AI returned an empty or invalid response for storyboard.");
    }
    
    const parsed = JSON.parse(jsonText);
    
    if (parsed.storyboard_prompts && Array.isArray(parsed.storyboard_prompts)) {
        return parsed.storyboard_prompts.map((p: any) => p.keyframe_prompt).filter(Boolean);
    } else {
        throw new Error("Invalid JSON structure received from AI for storyboard.");
    }

  } catch (error) {
    handleApiError(error, 'generate storyboard prompts');
  }
}

export const generateGifKeyframePrompts = async (gifDescription: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: gifDescription,
      config: {
        systemInstruction: GIF_STORYBOARD_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: GIF_STORYBOARD_SCHEMA,
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
        const blockReason = response?.candidates?.[0]?.finishReason;
        if (blockReason === 'SAFETY') {
            throw new Error("Content was blocked due to safety reasons. Please adjust your prompt.");
        }
        throw new Error("AI returned an empty or invalid response for GIF keyframes.");
    }
    
    const parsed = JSON.parse(jsonText);
    
    if (parsed.gif_keyframes && Array.isArray(parsed.gif_keyframes)) {
        return parsed.gif_keyframes.map((p: any) => p.keyframe_prompt).filter(Boolean);
    } else {
        throw new Error("Invalid JSON structure received from AI for GIF keyframes.");
    }

  } catch (error) {
    handleApiError(error, 'generate GIF keyframe prompts');
  }
}


export const generateImage = async (prompt: string, aspectRatio: ApiAspectRatio): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated. The model may have blocked the prompt for safety reasons.");
    }
  } catch (error) {
    handleApiError(error, 'generate image');
  }
};