
import mongoose from 'mongoose';

const SOPChunkSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  pageNumber: { type: Number, required: true },
  chunkText: { type: String, required: true },
  // TODO: Add index: 'vector' for Atlas Vector Search later
  vectorEmbedding: { type: [Number], default: [] },
  metadata: {
    uploadedAt: { type: Date, default: Date.now },
    fileType: { type: String, default: 'application/pdf' }
  }
}, { collection: 'sop_chunks' });

// Create a text index for basic keyword search (Week 2/3 bridge)
SOPChunkSchema.index({ chunkText: 'text' });

export const SOPChunkModel = mongoose.model('SOPChunk', SOPChunkSchema);
