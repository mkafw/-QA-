
import React, { useEffect, useRef } from 'react';
import { Objective, KeyResult } from '../types';
import { CheckCircle2, Circle, Target, AlertTriangle, ArrowRight } from 'lucide-react';

interface OKRViewProps {
  objectives: Objective[];
  highlightedId?: string | null;
  onToggleKR?: (objId: string, krId: string, currentStatus: KeyResult['status']) => void;
}

export const OKRView: React.FC<OKRViewProps> = ({ objectives, highlightedId, onToggleKR }) => {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (highlightedId && cardRefs.current.has(highlightedId)) {
        const el = cardRefs.current.get(highlightedId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [highlightedId]);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {objectives.map((obj, idx) => {
        const isHighlighted = highlightedId === obj.id;
        return (
        <div 
            key={obj.id} 
            ref={(el) => { if(el) cardRefs.current.set(obj.id, el); }}
            className={`relative group transition-all duration-700 ${isHighlighted ? 'scale-105 z-10' : ''}`}
        >
          {/* Connecting Line */}
          {idx !== objectives.length - 1 && (
            <div className="absolute left-8 top-full h-12 w-0.5 bg-gradient-to-b from-white/10 to-transparent"></div>
          )}

          <div className={`
              bg-white/5 backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-500 shadow-glass
              ${isHighlighted 
                ? 'border-cosmic-purple shadow-[0_0_30px_rgba(123,46,255,0.4)] bg-cosmic-purple/10' 
                : 'border-white/10 hover:bg-white/10'}
          `}>
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                 <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-purple/20 to-transparent border border-white/10 flex items-center justify-center shadow-inner">
                      <Target size={28} className="text-cosmic-purple drop-shadow-[0_0_10px_rgba(123,46,255,0.6)]" />
                   </div>
                   <div>
                      <div className="text-[10px] text-cosmic-gold font-medium tracking-widest uppercase mb-1">Objective 0{idx + 1}</div>
                      <h2 className="text-2xl font-medium text-white tracking-tight">{obj.title}</h2>
                   </div>
                 </div>
                 <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                   {obj.linkedQuestionIds.length} Nodes
                 </div>
              </div>
              
              <p className="text-white/60 font-light pl-22 ml-2">{obj.description}</p>
            </div>

            <div className="bg-black/20 p-6 space-y-4">
              {obj.keyResults.map((kr) => (
                <div 
                  key={kr.id} 
                  onClick={() => onToggleKR && onToggleKR(obj.id, kr.id, kr.status)}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all border group/kr cursor-pointer
                    ${kr.status === 'Completed' ? 'bg-cosmic-cyan/5 border-cosmic-cyan/20' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`transition-all duration-300 ${kr.status === 'Completed' ? 'scale-110' : 'scale-100 group-hover/kr:scale-110'}`}>
                       {kr.status === 'Completed' ? <CheckCircle2 className="text-cosmic-cyan" size={24} /> : <Circle className="text-white/20 group-hover/kr:text-white/60" size={24} />}
                    </div>
                    <div>
                        <span className={`text-sm block transition-colors ${kr.status === 'Completed' ? 'text-white/40 line-through' : 'text-gray-200'}`}>{kr.title}</span>
                        <span className="text-[10px] text-gray-500 font-mono mt-1 block">{kr.metric}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                     {kr.status !== 'Completed' && <ArrowRight size={14} className="text-white/0 group-hover/kr:text-white/40 -translate-x-2 group-hover/kr:translate-x-0 transition-all duration-300" />}
                     <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border border-white/5 ${
                        kr.status === 'Completed' ? 'bg-cosmic-cyan/20 text-cosmic-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 
                        kr.status === 'In Progress' ? 'bg-cosmic-gold/20 text-cosmic-gold' : 
                        'bg-white/5 text-gray-500'
                    }`}>
                        {kr.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      })}
    </div>
  );
};