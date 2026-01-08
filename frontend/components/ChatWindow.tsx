
import React from 'react';
import { ChatMessage } from '../../shared/types';

interface ChatWindowProps {
  messages: ChatMessage[];
  searching: boolean;
  query: string;
  setQuery: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, searching, query, setQuery, onSearch 
}) => {
  return (
    <main className="md:col-span-2 flex flex-col space-y-4 h-[70vh]">
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
              
              {msg.sources && msg.sources.length > 0 && (
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

      <form onSubmit={onSearch} className="flex gap-2">
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
  );
};
