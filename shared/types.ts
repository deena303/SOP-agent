
export interface SOPChunk {
  id: string;
  fileName: string;
  pageNumber: number;
  chunkText: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: SOPChunk[];
}

export interface IngestionResponse {
  success: boolean;
  message: string;
  chunksProcessed: number;
}
