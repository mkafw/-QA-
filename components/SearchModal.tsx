
import React, { useState, useMemo } from 'react';
import { Question, Objective, Failure } from '../types';
import { Search, X, FileQuestion, Target, AlertTriangle } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  objectives: Objective[];
  failures: Failure[];
  onSelectResult: (type: 'QUESTION' | 'OBJECTIVE' | 'FAILURE', id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  questions,
  objectives,
  failures,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return { questions: [], objectives: [], failures: [] };
    
    const q = query.toLowerCase();
    
    return {
      questions: questions.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.content.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      ).slice(0, 5),
      objectives: objectives.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.description.toLowerCase().includes(q)
      ).slice(0, 5),
      failures: failures.filter(i => 
        i.description.toLowerCase().includes(q) ||
        i.analysis5W2H?.toLowerCase().includes(q)
      ).slice(0, 5),
    };
  }, [query, questions, objectives, failures]);

  const total = results.questions.length + results.objectives.length + results.failures.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0a0a15] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索问题、目标、失败..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
            autoFocus
          />
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-white" size={20} />
          </button>
        </div>

        <div className="max-h-96 overflow-auto">
          {query && total === 0 && (
            <div className="p-8 text-center text-gray-500">
              未找到相关结果
            </div>
          )}

          {!query && (
            <div className="p-8 text-center text-gray-500">
              输入关键词开始搜索
            </div>
          )}

          {results.questions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FileQuestion size={14} /> 问题
              </div>
              {results.questions.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSelectResult('QUESTION', item.id); onClose(); }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3"
                >
                  <FileQuestion className="text-cosmic-blue" size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white truncate">{item.title}</div>
                    <div className="text-xs text-gray-500 truncate">{item.content.substring(0, 50)}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.status === 'Verified' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'Answered' ? 'bg-cosmic-blue/20 text-cosmic-blue' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>{item.status}</span>
                </button>
              ))}
            </div>
          )}

          {results.objectives.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Target size={14} /> 目标
              </div>
              {results.objectives.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSelectResult('OBJECTIVE', item.id); onClose(); }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3"
                >
                  <Target className="text-cosmic-purple" size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white truncate">{item.title}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description.substring(0, 50)}</div>
                  </div>
                  <span className="text-xs text-gray-500">{item.keyResults.length} KRs</span>
                </button>
              ))}
            </div>
          )}

          {results.failures.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={14} /> 失败
              </div>
              {results.failures.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onSelectResult('FAILURE', item.id); onClose(); }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3"
                >
                  <AlertTriangle className="text-cosmic-crimson" size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white truncate">{item.description.substring(0, 40)}</div>
                    <div className="text-xs text-gray-500">{item.status}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
