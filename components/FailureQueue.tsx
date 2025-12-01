import React from 'react';
import { Failure } from '../types';
import { Zap, ArrowRight, Radiation, RefreshCw } from 'lucide-react';

interface FailureQueueProps {
  failures: Failure[];
  onSediment: (failureId: string) => void;
}

export const FailureQueue: React.FC<FailureQueueProps> = ({ failures, onSediment }) => {
  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-8">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-cosmic-crimson/20 to-transparent border border-cosmic-crimson/30 flex items-center relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-cosmic-crimson/30 rounded-full blur-[50px]"></div>
        <div className="relative z-10">
          <h3 className="text-2xl text-white font-medium mb-2 flex items-center">
            <Radiation className="mr-3 text-cosmic-crimson" size={24} /> 
            Sedimentation Protocol
          </h3>
          <p className="text-white/60 text-sm font-light">Convert execution failures into structural wisdom.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {failures.map(f => (
          <div key={f.id} className="group bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden backdrop-blur-md hover:bg-white/10 transition-all shadow-glass">
            
            {/* Status light */}
            <div className={`absolute top-6 right-6 w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${f.status === 'New' ? 'bg-cosmic-crimson text-cosmic-crimson' : 'bg-cosmic-cyan text-cosmic-cyan'}`}></div>

            <h4 className="text-lg text-white font-medium mb-4 pr-10">{f.description}</h4>
            
            {f.analysis5W2H && (
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-sm text-gray-400 font-light mb-6">
                <div className="text-[10px] text-cosmic-crimson uppercase tracking-widest mb-2 font-bold">Root Cause Analysis</div>
                {f.analysis5W2H}
              </div>
            )}

            <div className="flex justify-end">
              {f.convertedToQuestionId ? (
                <span className="flex items-center text-cosmic-cyan text-xs font-medium uppercase tracking-wider">
                  <RefreshCw size={14} className="mr-2" /> Sedimented
                </span>
              ) : (
                 <button 
                  onClick={() => onSediment(f.id)}
                  className="flex items-center space-x-2 text-white bg-white/10 hover:bg-cosmic-gold/20 hover:text-cosmic-gold px-5 py-2.5 rounded-full transition-all text-xs font-medium tracking-wide group/btn"
                 >
                   <span>TRANSMUTE</span>
                   <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};