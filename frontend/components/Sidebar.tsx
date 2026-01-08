
import React from 'react';

interface SidebarProps {
  files: File[];
  ingesting: boolean;
  fileProgress: Record<string, number>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  files, ingesting, fileProgress, onFileChange, onUpload, fileInputRef 
}) => {
  return (
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
              onChange={onFileChange}
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
  );
};
