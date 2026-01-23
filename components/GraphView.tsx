
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Question, Objective, GraphNode, HelixStep } from '../types';
import { Zap, Target, Hand, X, Trash2, Edit, Ghost, RefreshCw } from 'lucide-react';
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

  // Interaction State
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const { steps, allNodes, links, recentNodeIds } = useMemo(() => {
    // Sort Newest First
    const sortedQ = [...questions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedO = [...objectives].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Calculate total needed steps
    const rawMax = Math.max(sortedQ.length, sortedO.length);
    // Dark Matter: Ensure minimum length to show gaps if sparse
    const maxSteps = Math.max(rawMax, 16); 
    
    const ladderSteps: HelixStep[] = [];
    const flatNodes: GraphNode[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Completed Objectives (Logic for Crystallization)
    const completedObjectiveIds = new Set(
        objectives.filter(o => o.keyResults.some(kr => kr.status === 'Completed')).map(o => o.id)
    );

    for (let i = 0; i < maxSteps; i++) {
        const q = sortedQ[i];
        const o = sortedO[i];
        const step: HelixStep = { index: i };
        
        if (q) {
            const isCrystallized = q.linkedOKRIds.some(id => completedObjectiveIds.has(id));
            const qNode: GraphNode = { 
              ...q, 
              label: q.title, group: 1, val: 1, type: 'QUESTION', strand: 'A', yBase: 0, index: i,
              isCrystallized,
              rawEntity: q
            };
            step.question = qNode;
            flatNodes.push(qNode);
            nodeMap.set(q.id, qNode);
        } else if (i > 0 && i < sortedQ.length + 2) {
            // DARK MATTER: Inject Ghost Node if gap in data but not end of list
            const ghostNode: GraphNode = {
                id: `ghost-q-${i}`, group: 0, label: 'VOID', val: 0.5,
                type: 'GHOST', strand: 'A', yBase: 0, index: i, isGhost: true
            };
            step.question = ghostNode;
            flatNodes.push(ghostNode);
        }

        if (o) {
            const isCrystallized = o.keyResults.some(kr => kr.status === 'Completed');
            const oNode: GraphNode = { 
              ...o, 
              label: o.title, group: 2, val: 1, type: 'OBJECTIVE', strand: 'B', yBase: 0, index: i,
              isCrystallized,
              rawEntity: o
            };
            step.objective = oNode;
            flatNodes.push(oNode);
            nodeMap.set(o.id, oNode);
        }
        ladderSteps.push(step);
    }

    // Standard Structural Links
    const finalLinks: any[] = [];
    flatNodes.forEach(source => {
         if (source.isGhost) return;
         const targets = [...(source.linkedQuestionIds || []), ...(source.linkedOKRIds || [])];
         targets.forEach(tid => {
             if (nodeMap.has(tid) && source.id < tid) {
                 finalLinks.push({ source: source, target: nodeMap.get(tid) });
             }
         })
    });

    // MUTATION: Inject 2 random "Chaos Links" between distant nodes
    if (flatNodes.length > 5) {
        for(let m=0; m<2; m++) {
            const start = flatNodes[Math.floor(Math.random() * flatNodes.length/2)];
            const end = flatNodes[Math.floor(Math.random() * flatNodes.length/2) + Math.floor(flatNodes.length/2)];
            if(start && end && !start.isGhost && !end.isGhost && start !== end) {
                finalLinks.push({ source: start, target: end, type: 'MUTATION' });
            }
        }
    }

    const sortedAll = [...flatNodes].filter(n => !n.isGhost).sort((a, b) => 
       new Date(b.rawEntity?.createdAt || 0).getTime() - new Date(a.rawEntity?.createdAt || 0).getTime()
    );
    const recentIds = new Set(sortedAll.slice(0, 3).map(n => n.id));

    return { steps: ladderSteps, allNodes: flatNodes, links: finalLinks, recentNodeIds: recentIds };
  }, [questions, objectives]);


  // --- Renderer Lifecycle ---
  useEffect(() => {
      if (!containerRef.current || !svgRef.current) return;
      rendererRef.current = new GraphRenderer({
          container: containerRef.current,
          svgElement: svgRef.current,
          onNodeHover: (node, x, y) => {
              setActiveNode(node);
              if (node) setTooltipPos({ x, y });
          },
          onNodeClick: (node, isShiftKey) => {
              if (node.isGhost) return; // Ghost nodes are untouchable
              setSelectedNode(prev => (prev?.id === node.id ? null : node));
              if (onNodeAction) onNodeAction(node.id, node.type as any, isShiftKey ? 'DELETE' : 'SELECT');
          },
          onBackgroundClick: () => {
              setSelectedNode(null);
          }
      });
      rendererRef.current.start();
      return () => { rendererRef.current?.stop(); };
  }, []);

  useEffect(() => {
      if (rendererRef.current) {
          const width = containerRef.current?.clientWidth || 800;
          const height = containerRef.current?.clientHeight || 600;
          rendererRef.current.updateDimensions(width, height);
          rendererRef.current.updateData(steps, allNodes, links, recentNodeIds);
      }
  }, [steps, allNodes, links, recentNodeIds]);

  useEffect(() => {
      rendererRef.current?.setSelected(selectedNode?.id || null);
  }, [selectedNode]);


  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-cosmic-deep cursor-grab active:cursor-grabbing">
      
      {/* Dynamic Stardust Background */}
      <div className="absolute inset-0 z-0 opacity-40" style={{
        backgroundImage: `radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
                          radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
                          radial-gradient(2px 2px at 90px 40px, #ddd, rgba(0,0,0,0)),
                          radial-gradient(1px 1px at 160px 120px, #ccc, rgba(0,0,0,0))`,
        backgroundSize: '200px 200px'
      }}></div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cosmic-blue/10 via-transparent to-transparent opacity-80 pointer-events-none"></div>
      
      <svg ref={svgRef} className="absolute inset-0 w-full h-full z-10" style={{ overflow: 'visible' }}></svg>
      
      {!selectedNode && !activeNode && (
        <div className="absolute bottom-8 right-8 text-white/40 flex items-center space-x-2 animate-pulse pointer-events-none select-none z-20">
            <Hand size={14} />
            <span className="text-[10px] tracking-widest uppercase">Drag to Rotate</span>
        </div>
      )}

      {/* Tooltip */}
      {activeNode && !selectedNode && (
        <div className="fixed z-50 pointer-events-none" style={{ left: tooltipPos.x + 40, top: tooltipPos.y - 20 }}>
          <div className="w-64 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200 origin-left">
            <div className={`h-0.5 w-full ${activeNode.isGhost ? 'bg-white/20' : activeNode.strand === 'A' ? 'bg-cosmic-gold shadow-[0_0_10px_#FFE580]' : 'bg-cosmic-purple shadow-[0_0_10px_#7B2EFF]'}`}></div>
            <div className="p-4 relative overflow-hidden">
               {/* Holographic Gloss */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2"></div>
               
               {activeNode.isGhost ? (
                   <div className="text-white/40 flex items-center gap-2">
                       <Ghost size={14} /> <span className="text-xs uppercase tracking-widest">Dark Matter</span>
                   </div>
               ) : (
                   <>
                    <div className="flex items-center space-x-2 mb-2">
                        {activeNode.type === 'QUESTION' ? <Zap size={12} className="text-cosmic-gold"/> : <Target size={12} className="text-cosmic-purple"/>}
                        <span className="text-[10px] font-bold text-gray-400 tracking-wider">COORDINATE {activeNode.index}</span>
                        {activeNode.isCrystallized && <RefreshCw size={10} className="text-cosmic-gold animate-spin-slow" />}
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1 leading-snug">{activeNode.label}</h3>
                   </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedNode && (
        <div onClick={(e) => e.stopPropagation()} className="absolute top-0 right-0 h-full w-full md:w-[450px] bg-black/80 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className={`h-1 w-full ${selectedNode.strand === 'A' ? 'bg-cosmic-gold shadow-[0_0_15px_#FFE580]' : 'bg-cosmic-purple shadow-[0_0_15px_#7B2EFF]'}`}></div>
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
                {selectedNode.isCrystallized && (
                    <div className="mb-6 inline-flex items-center px-3 py-1 bg-cosmic-gold/10 border border-cosmic-gold/30 rounded-lg text-cosmic-gold text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(255,229,128,0.2)]">
                        <RefreshCw size={12} className="mr-2"/> CRYSTALLIZED AXIOM
                    </div>
                )}
                <h2 className="text-3xl font-serif text-white mb-6 leading-tight drop-shadow-md">{selectedNode.label}</h2>
                <div className="prose prose-invert prose-sm text-gray-300 font-light leading-relaxed mb-8">
                    {selectedNode.content || <div className="italic text-white/20">No content.</div>}
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
