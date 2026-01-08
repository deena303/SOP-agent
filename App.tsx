
import React, { useState, useRef } from 'react';
import { SOPChunk, ChatMessage } from './types';
import { callGeminiAgent, generateGeminiSOPPrompt } from './services/geminiService';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [ingesting, setIngesting] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Week 1 & 4: Ingestion UI Logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      // Clear previous progress when new files are selected
      setFileProgress({});
    }
  };

  const onUpload = async () => {
    if (files.length === 0) return;
    setIngesting(true);
    
    // Initialize progress for all files
    const initialProgress: Record<string, number> = {};
    files.forEach(f => initialProgress[f.name] = 0);
    setFileProgress(initialProgress);

    // Simulate Sequential Ingestion (Week 1 Simulation)
    for (const file of files) {
      let progress = 0;
      while (progress < 100) {
        // Mock delay for PDF parsing and chunking
        await new Promise(r => setTimeout(r, 150 + Math.random() * 250));
        progress += Math.floor(Math.random() * 25) + 15;
        if (progress > 100) progress = 100;
        
        setFileProgress(prev => ({
          ...prev,
          [file.name]: progress
        }));
      }
    }
    
    // Brief pause at 100% for UX clarity
    await new Promise(r => setTimeout(r, 500));
    
    alert(`${files.length} SOPs successfully parsed and chunked! (Week 1 Base Complete)`);
    setIngesting(false);
    setFiles([]);
    setFileProgress({});
  };

  // Week 2, 3 & 4: Retrieval & Agent UI Logic
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setSearching(true);
    setQuery('');

    try {
      // Step 1: Retrieval (Mock /api/search)
      const mockChunks: SOPChunk[] = [
        { id: '1', fileName: 'Policy_Manual.pdf', pageNumber: 12, chunkText: 'All employees must badge in before 9:00 AM.' },
        { id: '2', fileName: 'HR_Benefits.pdf', pageNumber: 3, chunkText: 'Health insurance covers dental and vision.' }
      ];

      // Step 2: Agent (Gemini Prompting)
      const answerText = await callGeminiAgent(userMsg.content, mockChunks);
      
      const assistantMsg: ChatMessage = { 
        role: 'assistant', 
        content: answerText,
        sources: mockChunks 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">OpsMind AI</h1>
          <p className="text-slate-500 text-sm">Enterprise SOP Knowledge Agent</p>
        </div>
        <div className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
          Base Architecture v1.0
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar: Week 1 Knowledge Ingestion */}
        <aside className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-700">Knowledge Base</h2>
            <div className="space-y-4">
              <div 
                onClick={() => !ingesting && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  ingesting 
                  ? 'border-slate-100 bg-slate-50 cursor-not-allowed' 
                  : 'border-slate-300 cursor-pointer hover:border-indigo-400'
                }`}
              >
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={ingesting}
                />
                <p className="text-sm text-slate-600">Click to upload SOP PDFs</p>
                <span className="text-xs text-slate-400">Week 1: Multer + pdf-parse</span>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue</span>
                    <span className="text-[10px] text-slate-400">{files.length} Files</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-3 bg-slate-50 p-3 rounded border border-slate-200 overflow-hidden">
                    {files.map((f, i) => (
                      <li key={i} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="truncate flex-1 pr-2">{f.name}</span>
                          {ingesting && (
                            <span className="text-indigo-600 font-bold tabular-nums">
                              {fileProgress[f.name] || 0}%
                            </span>
                          )}
                        </div>
                        {ingesting && (
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                              style={{ width: `${fileProgress[f.name] || 0}%` }}
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                onClick={onUpload}
                disabled={files.length === 0 || ingesting}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  files.length === 0 || ingesting 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                }`}
              >
                {ingesting ? 'Processing Documents...' : 'Ingest SOPs'}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">RAG Engine Stats</h3>
            <div className="text-xs text-amber-700 space-y-1">
              <p>Chunks: 1,000 chars</p>
              <p>Overlap: 100 chars</p>
              <p>Storage: Local Mock (DB Pending)</p>
            </div>
          </div>
        </aside>

        {/* Main: Week 2, 3, 4 Search & Chat */}
        <main className="md:col-span-2 flex flex-col space-y-4 h-[70vh]">
          {/* Chat Window */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-2">
                <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p>Ask a question about the enterprise SOPs</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  
                  {msg.sources && (
                    <div className="mt-3 pt-3 border-t border-slate-200/50">
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Sources Cited:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, sidx) => (
                          <div key={sidx} className="text-[10px] bg-white/50 px-2 py-1 rounded border border-slate-300 text-slate-600 truncate max-w-[150px]">
                            {src.fileName} (p. {src.pageNumber})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {searching && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none animate-pulse text-slate-400 text-sm">
                  OpsMind is scanning SOPs...
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. What is the remote work policy?"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={searching || !query.trim()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-lg"
            >
              Ask
            </button>
          </form>
        </main>
      </div>

      {/* Footer / Explanation Area */}
      <section className="bg-slate-800 text-slate-300 p-8 rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-6">Internal Project Specification (Zaalima Dev)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="font-bold text-indigo-400 mb-2 underline decoration-indigo-400/30">Week-wise Implementation Status</h3>
            <ul className="space-y-3 opacity-90">
              <li><strong className="text-white">Week 1 (Ingestion):</strong> Multer routes ready, `chunkText` util implemented (1k char / 100 overlap). UI enhanced with per-file progress tracking.</li>
              <li><strong className="text-white">Week 2 (Retrieval):</strong> Search route placeholder ready, context builder logic defined.</li>
              <li><strong className="text-white">Week 3 (Agent):</strong> Gemini Prompt Template enforced with strict rules for zero hallucination.</li>
              <li><strong className="text-white">Week 4 (UI):</strong> Enterprise React dashboard with integrated file upload and chat interface.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-indigo-400 mb-2 underline decoration-indigo-400/30">Hallucination Prevention Logic</h3>
            <p className="opacity-90 leading-relaxed mb-4">
              Hallucinations are prevented via <strong>Prompt Shielding</strong> and <strong>Contextual Anchoring</strong>. The model is explicitly instructed to refuse answering if the context provided is insufficient.
            </p>
            <div className="bg-slate-900/50 p-4 rounded border border-slate-700 font-mono text-xs">
              <span className="text-emerald-400">// Strict Fallback Enforcement</span><br/>
              If answer not found → respond: "I don’t know based on the provided SOPs"
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
