import React from 'react';
import { Objective } from '../types';
import { CheckCircle2, Circle, Target, AlertTriangle } from 'lucide-react';

interface OKRViewProps {
  objectives: Objective[];
}

export const OKRView: React.FC<OKRViewProps> = ({ objectives }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {objectives.map((obj, idx) => (
        <div key={obj.id} className="relative group">
          {/* Connecting Line */}
          {idx !== objectives.length - 1 && (
            <div className="absolute left-8 top-full h-12 w-0.5 bg-gradient-to-b from-white/10 to-transparent"></div>
          )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 shadow-glass">
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
                <div key={kr.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors group/kr border border-transparent hover:border-white/5">
                  <div className="flex items-center space-x-4">
                    {kr.status === 'Completed' ? <CheckCircle2 className="text-cosmic-cyan" size={20} /> : <Circle className="text-white/20" size={20} />}
                    <span className={`text-sm ${kr.status === 'Completed' ? 'text-white/40 line-through' : 'text-gray-200'}`}>{kr.title}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
                    kr.status === 'Completed' ? 'bg-cosmic-cyan/20 text-cosmic-cyan' : 
                    kr.status === 'In Progress' ? 'bg-cosmic-gold/20 text-cosmic-gold' : 
                    'bg-white/10 text-gray-500'
                  }`}>
                    {kr.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};