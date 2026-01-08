
/**
 * Week 1 — Chunking Logic
 * Splits text into 1000 character segments with 100 character overlap.
 */
export const chunkText = (text, fileName, pageNumber) => {
  const chunkSize = 1000;
  const overlap = 100;
  const chunks = [];
  
  let startIndex = 0;
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunkText = text.substring(startIndex, endIndex);
    
    chunks.push({
      fileName,
      pageNumber,
      chunkText,
      // Metadata placeholders
      createdAt: new Date().toISOString()
    });
    
    // Move start index forward by (chunkSize - overlap)
    startIndex += (chunkSize - overlap);
    
    // Safety break for empty text or loop errors
    if (startIndex >= text.length || chunkSize <= overlap) break;
  }
  
  return chunks;
};
