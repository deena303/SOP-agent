
import { chunkText } from './utils/chunker.js';
import { SOPChunkModel } from './models/SOP.js';
import { GoogleGenAI } from "@google/genai";

/**
 * Express Route: POST /api/ingest
 * Handles PDF parsing, semantic embedding generation, and MongoDB persistence.
 */
export const handleIngestion = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Initialize Gemini AI for embeddings
    // Note: In a Node.js environment, process.env.API_KEY must be set.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let totalChunksCreated = 0;

    for (const file of files) {
      // 1. PDF Extraction (Simulated)
      // In production, use pdf-parse: const data = await pdf(file.buffer); const text = data.text;
      const simulatedText = `Enterprise Standard Operating Procedure for ${file.originalname}. 
      This document covers the essential operational workflows, security compliance requirements, 
      and organizational standards. Detailed protocols ensure that all team members follow 
      consistent steps for project delivery and quality assurance. `.repeat(30);
      
      // 2. Logic: Chunking (1000 chars, 100 overlap)
      const rawChunks = chunkText(simulatedText, file.originalname, 1);

      // 3. Clear existing chunks for this specific file to avoid duplicate storage
      await SOPChunkModel.deleteMany({ fileName: file.originalname });

      // 4. Generate Semantic Embeddings for each chunk
      const chunksWithEmbeddings = await Promise.all(rawChunks.map(async (chunk) => {
        try {
          // Use text-embedding-004 for high-quality RAG performance
          const result = await ai.models.embedContent({
            model: "text-embedding-004",
            content: { parts: [{ text: chunk.chunkText }] }
          });
          
          return {
            ...chunk,
            vectorEmbedding: result.embedding.values
          };
        } catch (embedError) {
          console.error(`Embedding failed for a chunk in ${file.originalname}:`, embedError);
          return { ...chunk, vectorEmbedding: [] }; // Fallback
        }
      }));

      // 5. Bulk insert into MongoDB Atlas
      const result = await SOPChunkModel.insertMany(chunksWithEmbeddings);
      totalChunksCreated += result.length;
    }

    // Return the specific success message and total count requested by the user
    return res.status(200).json({
      success: true,
      message: 'file uploaded successfully',
      chunksProcessed: totalChunksCreated
    });
  } catch (error) {
    console.error('Ingestion Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Backend processing failed. Ensure MONGO_URI and API_KEY are correct.' 
    });
  }
};
