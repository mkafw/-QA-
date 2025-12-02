
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { select, timer as d3Timer, line, curveBasis } from 'd3';
import { Question, Objective, GraphNode } from '../types';
import { Trash2, Maximize2 } from 'lucide-react';
import { calculateHelixPoint, calculateHelixDimensions } from '../utils/helixMath';

interface GraphViewProps {
  questions: Question[];
  objectives: Objective[];
  onNodeAction?: (id: string, type: 'QUESTION'|'OBJECTIVE', action: 'SELECT'|'DELETE') => void;
}

export const GraphView: React.FC<GraphViewProps> = ({ questions, objectives, onNodeAction }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  
  // Interaction State
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const isPausedRef = useRef(false);

  // Prepare Data Mappings
  const { itemsA, itemsB } = useMemo(() => {
    return {
      itemsA: [...questions].sort((a, b) => a.level - b.level),
      itemsB: [...objectives].sort((a, b) => a.id.localeCompare(b.id))
    };
  }, [questions, objectives]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    // 1. Dimensions
    let width = containerRef.current.clientWidth || 800;
    let height = containerRef.current.clientHeight || 600;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // 2. Setup Canvas
    const defs = svg.append("defs");
    const nebulaFilter = defs.append("filter").attr("id", "nebula-blur");
    nebulaFilter.append("feGaussianBlur").attr("stdDeviation", "6");
    const gradGold = defs.append("radialGradient").attr("id", "orbGradGold");
    gradGold.append("stop").attr("offset", "10%").attr("stop-color", "#fff");
    gradGold.append("stop").attr("offset", "100%").attr("stop-color", "#FFD700");
    const gradPurple = defs.append("radialGradient").attr("id", "orbGradPurple");
    gradPurple.append("stop").attr("offset", "10%").attr("stop-color", "#fff");
    gradPurple.append("stop").attr("offset", "100%").attr("stop-color", "#7B2EFF");

    // Groups - Order matters for Z-index
    const nebulaGroup = svg.append("g").attr("class", "nebula");
    const dataLinksGroup = svg.append("g").attr("class", "data-links"); // REAL LINKS BEHIND NODES
    const rungsGroup = svg.append("g").attr("class", "rungs"); // STRUCTURAL RUNGS
    const nodesGroup = svg.append("g").attr("class", "nodes"); // NODES ON TOP

    // Paths
    const pathA_blur = nebulaGroup.append("path").attr("stroke", "#FFD700").attr("stroke-width", 20).attr("stroke-opacity", 0.1).attr("fill", "none").attr("filter", "url(#nebula-blur)");
    const pathA_core = nebulaGroup.append("path").attr("stroke", "#FFD700").attr("stroke-width", 2).attr("stroke-opacity", 0.8).attr("fill", "none");
    const pathB_blur = nebulaGroup.append("path").attr("stroke", "#7B2EFF").attr("stroke-width", 20).attr("stroke-opacity", 0.1).attr("fill", "none").attr("filter", "url(#nebula-blur)");
    const pathB_core = nebulaGroup.append("path").attr("stroke", "#7B2EFF").attr("stroke-width", 2).attr("stroke-opacity", 0.8).attr("fill", "none");

    // 3. Helix Parameters
    const maxDataCount = Math.max(itemsA.length, itemsB.length, 6);
    const { height: helixHeight, startY } = calculateHelixDimensions(height, maxDataCount);

    // 4. Render Nodes
    const renderedNodes: GraphNode[] = [];
    const createNodeData = (items: any[], strand: 'A'|'B', group: number) => {
      items.forEach((d: any, i: number) => {
        // Map linearly along helix height
        const yBase = startY + i * (helixHeight / (maxDataCount - 1 || 1));
        renderedNodes.push({ 
          ...d, 
          yBase, 
          strand, 
          group,
          rawEntity: d,
          content: d.content || d.description,
          assets: d.assets,
          label: d.title,
          val: 1
        } as any);
      });
    };
    createNodeData(itemsA, 'A', 1);
    createNodeData(itemsB, 'B', 2);

    const nodeElements = nodesGroup.selectAll("g")
      .data(renderedNodes)
      .enter().append("g")
      .style("cursor", "pointer")
      .attr("pointer-events", "all") // Ensure clickable
      .on("mouseenter", (e: any, d: any) => {
        isPausedRef.current = true;
        setActiveNode(d);
        setTooltipPos({ x: e.clientX, y: e.clientY });
      })
      .on("mouseleave", () => {
        isPausedRef.current = false;
        setActiveNode(null);
      })
      .on("click", (e: any, d: any) => {
        if (onNodeAction) {
           // Shift click to delete
           if (e.shiftKey) {
             onNodeAction(d.id, d.group === 1 ? 'QUESTION' : 'OBJECTIVE', 'DELETE');
           } else {
             onNodeAction(d.id, d.group === 1 ? 'QUESTION' : 'OBJECTIVE', 'SELECT');
           }
        }
      });

    nodeElements.append("circle")
      .attr("r", 6)
      .attr("fill", (d: any) => d.strand === 'A' ? "url(#orbGradGold)" : "url(#orbGradPurple)")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);

    // 5. Structural Rungs
    const rungSpacing = 15; // Dense rungs
    const numRungs = Math.floor(helixHeight / rungSpacing);
    const rungsData = Array.from({length: numRungs}, (_, i) => ({ yBase: startY + i * rungSpacing }));
    
    const rungElements = rungsGroup.selectAll("line")
      .data(rungsData).enter().append("line")
      .attr("stroke", "white").attr("stroke-width", 0.5);

    // 5b. REAL DATA LINKS (Restored Logic)
    const linkPairs: {src: GraphNode, tgt: GraphNode}[] = [];
    renderedNodes.forEach(node => {
      if (node.group === 1) { // Question
        const q = node.rawEntity as Question;
        if (q.linkedOKRIds && q.linkedOKRIds.length > 0) {
          q.linkedOKRIds.forEach(okrId => {
            const target = renderedNodes.find(n => n.id === okrId);
            if (target) linkPairs.push({ src: node, tgt: target });
          });
        }
      }
    });

    const dataLinkElements = dataLinksGroup.selectAll("line")
      .data(linkPairs).enter().append("line")
      .attr("stroke", "#00F0FF") // Cyan color
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.8); // Higher opacity


    // 6. Animation Loop
    const tick = () => {
      if (!isPausedRef.current) rotationRef.current += 0.01;
      const rot = rotationRef.current;

      // Helper to get 3D pos
      const getPos = (yBase: number, strand: 'A'|'B') => 
        calculateHelixPoint(yBase, strand, rot, width, startY, helixHeight);

      // Update Structural Rungs
      rungElements
        .attr("x1", (d: any) => getPos(d.yBase, 'A').x)
        .attr("y1", (d: any) => getPos(d.yBase, 'A').y)
        .attr("x2", (d: any) => getPos(d.yBase, 'B').x)
        .attr("y2", (d: any) => getPos(d.yBase, 'B').y)
        .attr("opacity", (d: any) => {
           const z = getPos(d.yBase, 'A').z;
           return z > 0 ? 0.15 : 0.05; 
        });

      // Update Real Data Links
      dataLinkElements
         .attr("x1", (d: any) => getPos(d.src.yBase as number, d.src.strand as any).x)
         .attr("y1", (d: any) => getPos(d.src.yBase as number, d.src.strand as any).y)
         .attr("x2", (d: any) => getPos(d.tgt.yBase as number, d.tgt.strand as any).x)
         .attr("y2", (d: any) => getPos(d.tgt.yBase as number, d.tgt.strand as any).y)
         .attr("opacity", (d: any) => {
             const z1 = getPos(d.src.yBase as number, d.src.strand as any).z;
             const z2 = getPos(d.tgt.yBase as number, d.tgt.strand as any).z;
             // Visible if roughly in front
             return (z1 + z2) / 2 > 0 ? 0.9 : 0.3;
         });

      // Update Nodes
      nodeElements.attr("transform", (d: any) => {
        const p = getPos(d.yBase, d.strand);
        const scale = 0.5 + ((p.z + 1) / 2) * 0.8; 
        return `translate(${p.x},${p.y}) scale(${scale})`;
      }).attr("opacity", (d: any) => {
        const z = getPos(d.yBase, d.strand).z;
        return 0.4 + ((z + 1) / 2) * 0.6;
      });

      // Update DNA Strands
      const steps = 100;
      const pointsA: [number, number][] = [];
      const pointsB: [number, number][] = [];
      for(let i=0; i<=steps; i++) {
        const t = i/steps;
        const y = startY + t * helixHeight;
        const pA = getPos(y, 'A');
        const pB = getPos(y, 'B');
        pointsA.push([pA.x, pA.y]);
        pointsB.push([pB.x, pB.y]);
      }
      const lineGen = line().curve(curveBasis);
      const dA = lineGen(pointsA as any);
      const dB = lineGen(pointsB as any);
      if(dA) { pathA_blur.attr("d", dA); pathA_core.attr("d", dA); }
      if(dB) { pathB_blur.attr("d", dB); pathB_core.attr("d", dB); }
    };

    const timer = d3Timer(tick);
    return () => timer.stop();

  }, [itemsA, itemsB, onNodeAction]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ pointerEvents: 'none' }}>
        {/* Enable pointer events ONLY on groups inside nodes */}
        <style>{`
          .nodes g { pointer-events: auto; }
        `}</style>
      </svg>
      
      {/* 3D Holographic Tooltip */}
      {activeNode && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ 
            left: tooltipPos.x + 20, 
            top: tooltipPos.y - 40,
            perspective: '1000px' 
          }}
        >
          <div className="w-64 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 origin-top-left">
            {/* Gloss Header */}
            <div className={`h-1 w-full ${activeNode.group === 1 ? 'bg-cosmic-gold' : 'bg-cosmic-purple'}`}></div>
            
            {/* Image Asset Preview */}
            {activeNode.assets && activeNode.assets.length > 0 && (
              <div className="relative h-32 w-full border-b border-white/10">
                <img src={activeNode.assets[0]} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-4">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                 {activeNode.group === 1 ? 'Cognition Node' : 'Strategy Node'}
              </div>
              <h3 className="text-sm font-medium text-white mb-2 leading-tight">{activeNode.label}</h3>
              {activeNode.content && (
                <p className="text-xs text-gray-400 line-clamp-3 font-light leading-relaxed">{activeNode.content}</p>
              )}
              
              {/* Actions Hint */}
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-[9px] text-gray-500">
                <span className="flex items-center"><Maximize2 size={8} className="mr-1"/> Click to Inspect</span>
                <span className="flex items-center text-cosmic-crimson"><Trash2 size={8} className="mr-1"/> Shift+Click Delete</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
