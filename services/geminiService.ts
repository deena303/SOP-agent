
import { SOPChunk } from '../types';

/**
 * Week 3 — Chat Agent Logic
 * This service handles prompt construction and rule enforcement.
 */
export const generateGeminiSOPPrompt = (query: string, contextChunks: SOPChunk[]) => {
  const contextText = contextChunks
    .map(c => `[Source: ${c.fileName}, Page: ${c.pageNumber}]\nContent: ${c.chunkText}`)
    .join('\n\n---\n\n');

  // Enterprise Prompt Template
  return `
    You are OpsMind AI, a strict Enterprise SOP Assistant.
    
    RULES:
    1. Answer ONLY from the provided Context below.
    2. If the answer is not contained in the Context, respond EXACTLY with: "I don’t know based on the provided SOPs".
    3. Do NOT use outside knowledge or hallucinate details.
    4. Provide a single, concise final answer.
    5. CITATION RULE: You MUST cite the source for every major point using this format: "According to <Document Name>, Page <Number>".

    CONTEXT:
    ${contextText}

    QUESTION:
    ${query}

    FINAL ANSWER:
  `.trim();
};

/**
 * Placeholder for the actual Gemini API call
 */
export const callGeminiAgent = async (query: string, chunks: SOPChunk[]) => {
  const prompt = generateGeminiSOPPrompt(query, chunks);
  console.log('Sending Prompt to Gemini:', prompt);

  // TODO: Call Gemini API (Week 3/Future)
  // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // const response = await ai.models.generateContent({
  //   model: 'gemini-1.5-flash',
  //   contents: prompt
  // });
  // return response.text;

  return `This is a mock response demonstrating the citation format. According to SOP_HR_01.pdf, Page 5, employees have 20 days of leave.`;
};
