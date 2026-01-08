
import { SOPChunkModel } from './models/SOP.js';
import { GoogleGenAI } from "@google/genai";

/**
 * Express Route: POST /api/search
 * Performs Atlas Vector Search to retrieve semantically relevant context.
 */
export const handleSearch = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 1. Generate embedding for the user's query
    const embeddingResult = await ai.models.embedContent({
      model: "text-embedding-004",
      content: { parts: [{ text: query }] }
    });
    const queryVector = embeddingResult.embedding.values;

    // 2. Execute Atlas Vector Search via Aggregation
    // Requires a vector index named 'vector_index' on the 'vectorEmbedding' field
    const chunks = await SOPChunkModel.aggregate([
      {
        "$vectorSearch": {
          "index": "vector_index",
          "path": "vectorEmbedding",
          "queryVector": queryVector,
          "numCandidates": 100,
          "limit": 5
        }
      },
      {
        "$project": {
          "vectorEmbedding": 0, // Exclude heavy vector data from response
          "score": { "$meta": "vectorSearchScore" }
        }
      }
    ]);

    return res.status(200).json({ chunks: chunks || [] });
  } catch (error) {
    console.error('Vector Search Error:', error);
    // Fallback to text search if vector search is not yet indexed or configured
    try {
      const fallbackChunks = await SOPChunkModel.find({
        chunkText: { $regex: query, $options: 'i' }
      }).limit(5).lean();
      return res.status(200).json({ chunks: fallbackChunks });
    } catch (fallbackError) {
      return res.status(500).json({ error: 'Retrieval engine failure' });
    }
  }
};
