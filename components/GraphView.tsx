
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Question, Objective, GraphNode } from '../types';
import { Zap, Target, Hand, X, Trash2, Edit } from 'lucide-react';
import { GraphRenderer } from '../logic/GraphRenderer';

interface GraphViewProps {
  questions: Question[];
  objectives: Objective[];
  onNodeAction?: (id: string, type: 'QUESTION'|'OBJECTIVE', action: 'SELECT'|'DELETE') => void;
}

export const GraphView: React.FC<GraphViewProps> = ({ questions, objectives, onNodeAction }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rendererRef = useRef<GraphRenderer | null>(null);

  // Interaction State (Managed by React for UI overlay)
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null); // For Hover Tooltip
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null); // For Click Detail Panel
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // --- Data Transformation Logic (Keep simple processing here, passing pure data to Renderer) ---
  const { steps, allNodes, links, recentNodeIds } = useMemo(() => {
    // Sort Newest First
    const sortedQ = [...questions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedO = [...objectives].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const maxSteps = Math.max(sortedQ.length, sortedO.length, 12);
    const ladderSteps = [];
    const flatNodes: GraphNode[] = [];
    const nodeMap = new Map<string, GraphNode>();

    for (let i = 0; i < maxSteps; i++) {
        const q = sortedQ[i];
        const o = sortedO[i];
        const step: any = { index: i };
        
        if (q) {
            const qNode: any = { ...q, label: q.title, type: 'QUESTION', strand: 'A', index: i };
            step.question = qNode;
            flatNodes.push(qNode);
            nodeMap.set(q.id, qNode);
        }
        if (o) {
            const oNode: any = { ...o, label: o.title, type: 'OBJECTIVE', strand: 'B', index: i };
            step.objective = oNode;
            flatNodes.push(oNode);
            nodeMap.set(o.id, oNode);
        }
        ladderSteps.push(step);
    }

    // Links
    const structuralLinks: any[] = [];
    flatNodes.forEach(source => {
         const targets = [...(source.linkedQuestionIds || []), ...(source.linkedOKRIds || [])];
         targets.forEach(tid => {
             if (nodeMap.has(tid) && source.id < tid) {
                 structuralLinks.push({ source: source, target: nodeMap.get(tid) });
             }
         })
    });

    // Recent 3 IDs
    const sortedAll = [...flatNodes].sort((a, b) => 
       new Date(b.rawEntity?.createdAt || 0).getTime() - new Date(a.rawEntity?.createdAt || 0).getTime()
    );
    const recentIds = new Set(sortedAll.slice(0, 3).map(n => n.id));

    return { steps: ladderSteps, allNodes: flatNodes, links: structuralLinks, recentNodeIds: recentIds };
  }, [questions, objectives]);


  // --- Renderer Lifecycle ---
  useEffect(() => {
      if (!containerRef.current || !svgRef.current) return;

      // Initialize Renderer
      rendererRef.current = new GraphRenderer({
          container: containerRef.current,
          svgElement: svgRef.current,
          onNodeHover: (node, x, y) => {
              setActiveNode(node);
              if (node) setTooltipPos({ x, y });
          },
          onNodeClick: (node, isShiftKey) => {
              setSelectedNode(prev => (prev?.id === node.id ? null : node));
              if (onNodeAction) onNodeAction(node.id, node.type as any, isShiftKey ? 'DELETE' : 'SELECT');
          },
          onBackgroundClick: () => {
              setSelectedNode(null);
          }
      });

      rendererRef.current.start();

      return () => {
          rendererRef.current?.stop();
      };
  }, []); // Run once on mount

  // Update Data when Props Change
  useEffect(() => {
      if (rendererRef.current) {
          const width = containerRef.current?.clientWidth || 800;
          const height = containerRef.current?.clientHeight || 600;
          rendererRef.current.updateDimensions(width, height);
          rendererRef.current.updateData(steps, allNodes, links, recentNodeIds);
      }
  }, [steps, allNodes, links, recentNodeIds]);

  // Sync Selection State to Renderer
  useEffect(() => {
      rendererRef.current?.setSelected(selectedNode?.id || null);
  }, [selectedNode]);


  return (
    <div 
        ref={containerRef} 
        className="w-full h-full relative overflow-hidden bg-radial-cosmic cursor-grab active:cursor-grabbing"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cosmic-blue/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      
      {/* Renderer Target */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
      </svg>
      
      {/* Interaction Hint */}
      {!selectedNode && !activeNode && (
        <div className="absolute bottom-8 right-8 text-white/20 flex items-center space-x-2 animate-pulse pointer-events-none select-none">
            <Hand size={14} />
            <span className="text-[10px] tracking-widest uppercase">Drag to Rotate</span>
        </div>
      )}

      {/* React Tooltip Layer (Managed by React) */}
      {activeNode && !selectedNode && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltipPos.x + 40, top: tooltipPos.y - 20 }}
        >
          <div className="w-64 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-left">
            <div className={`h-0.5 w-full ${activeNode.strand === 'A' ? 'bg-cosmic-gold' : 'bg-cosmic-purple'}`}></div>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                 {activeNode.type === 'QUESTION' ? <Zap size={12} className="text-cosmic-gold"/> : <Target size={12} className="text-cosmic-purple"/>}
                 <span className="text-[10px] font-bold text-gray-400 tracking-wider">COORDINATE {activeNode.index}</span>
              </div>
              <h3 className="text-sm font-medium text-white mb-1 leading-snug">{activeNode.label}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel Layer */}
      {selectedNode && (
        <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-black/80 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 animate-in slide-in-from-right duration-300 flex flex-col"
        >
            <div className={`h-1 w-full ${selectedNode.strand === 'A' ? 'bg-cosmic-gold' : 'bg-cosmic-purple'}`}></div>
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                         {selectedNode.type === 'QUESTION' ? <Zap size={14} className="text-cosmic-gold"/> : <Target size={14} className="text-cosmic-purple"/>}
                         <span className="text-[10px] font-bold text-white/60 tracking-widest">{selectedNode.type}</span>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <h2 className="text-3xl font-serif text-white mb-6 leading-tight">{selectedNode.label}</h2>
                <div className="prose prose-invert prose-sm text-gray-300 font-light leading-relaxed mb-8">
                    {selectedNode.content || <div className="italic text-white/20">No content.</div>}
                </div>
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Index</div>
                        <div className="text-lg text-white font-mono">{selectedNode.index}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                         <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Strand</div>
                         <div className={`text-lg font-mono ${selectedNode.strand === 'A' ? 'text-cosmic-gold' : 'text-cosmic-purple'}`}>
                             {selectedNode.strand}
                         </div>
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-xl flex space-x-4">
                 <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center text-xs font-bold tracking-widest transition-all border border-white/5 group">
                    <Edit size={14} className="mr-2 text-gray-400 group-hover:text-white"/> EDIT
                 </button>
                 <button 
                    onClick={() => {
                        if (confirm('Delete node?')) {
                            if (onNodeAction) onNodeAction(selectedNode.id, selectedNode.type as any, 'DELETE');
                            setSelectedNode(null);
                        }
                    }}
                    className="flex-1 py-3 bg-cosmic-crimson/10 hover:bg-cosmic-crimson/20 text-cosmic-crimson rounded-xl flex items-center justify-center text-xs font-bold tracking-widest transition-all border border-cosmic-crimson/20"
                 >
                    <Trash2 size={14} className="mr-2"/> DELETE
                 </button>
            </div>
        </div>
      )}
    </div>
  );
};
