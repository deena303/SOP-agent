
import { GoogleGenAI } from "@google/genai";
import { SOPChunk } from '../../shared/types';

export const generateGeminiSOPPrompt = (query: string, contextChunks: SOPChunk[]) => {
  const contextText = contextChunks
    .map(c => `[Source: ${c.fileName}, Page: ${c.pageNumber}]\nContent: ${c.chunkText}`)
    .join('\n\n---\n\n');

  return `
    You are OpsMind AI, a strict Enterprise SOP Assistant.
    
    STRICT RULES:
    1. Answer the question ONLY using the facts in the provided CONTEXT.
    2. If the answer is NOT present in the context, you MUST respond exactly: "I don’t know based on the provided SOPs".
    3. Never mention your training data or outside knowledge.
    4. CITATION REQUIREMENT: For every claim you make, cite the source in-line. 
       Example: "According to Policy_A.pdf, Page 4, the deadline is Friday."
    5. Maintain a professional, enterprise-grade tone.

    CONTEXT:
    ${contextText}

    QUESTION:
    ${query}

    FINAL ANSWER:
  `.trim();
};

export const callGeminiAgent = async (query: string, chunks: SOPChunk[]) => {
  if (!chunks || chunks.length === 0) {
    return "I don’t know based on the provided SOPs";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = generateGeminiSOPPrompt(query, chunks);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1, // Low temperature to minimize creative hallucination
        topP: 0.95,
      }
    });

    return response.text || "I don’t know based on the provided SOPs";
  } catch (error) {
    console.error("Gemini Agent Error:", error);
    return "The assistant encountered an error while processing your request. Please try again.";
  }
};
