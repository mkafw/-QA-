import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  select, 
  forceSimulation, 
  forceLink, 
  forceManyBody, 
  forceCenter, 
  line, 
  curveBasis, 
  timer as d3Timer 
} from 'd3';
import { Question, Objective, GraphNode, GraphLink } from '../types';
import { Network, Dna, Image as ImageIcon } from 'lucide-react';

interface GraphViewProps {
  questions: Question[];
  objectives: Objective[];
}

export const GraphView: React.FC<GraphViewProps> = ({ questions, objectives }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutMode, setLayoutMode] = useState<'HELIX' | 'FORCE'>('HELIX');
  
  // Use Ref for rotation to avoid React re-renders on every frame
  const rotationRef = useRef(0);
  
  // Interaction State
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const isPausedRef = useRef(false);

  // Prepare Data
  const { nodes, links, helixData } = useMemo(() => {
    const rawNodes: GraphNode[] = [];
    const rawLinks: GraphLink[] = [];
    
    questions.forEach(q => {
      rawNodes.push({ 
        id: q.id, 
        group: 1, 
        label: q.title, 
        level: q.level, 
        val: 5 + (q.level * 2),
        content: q.content,
        assets: q.assets,
        tags: q.tags
      });
      q.linkedQuestionIds.forEach(targetId => rawLinks.push({ source: q.id, target: targetId, type: 'related' }));
    });

    objectives.forEach(o => {
      rawNodes.push({ 
        id: o.id, 
        group: 2, 
        label: o.title, 
        val: 12,
        content: o.description,
        tags: ['Objective']
      });
      o.linkedQuestionIds.forEach(qid => rawLinks.push({ source: o.id, target: qid, type: 'supports' }));
      o.keyResults.forEach(kr => {
        rawNodes.push({ 
          id: kr.id, 
          group: 3, 
          label: kr.title, 
          val: 8,
          content: `Metric: ${kr.metric}`,
          tags: ['Key Result', kr.status]
        });
        rawLinks.push({ source: o.id, target: kr.id, type: 'related' });
      });
    });

    const sortedQuestions = [...questions].sort((a, b) => a.level - b.level);
    const sortedObjectives = [...objectives].sort((a, b) => a.id.localeCompare(b.id));

    return { nodes: rawNodes, links: rawLinks, helixData: { sortedQuestions, sortedObjectives } };
  }, [questions, objectives]);

  // Main D3 Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    // Robust Dimension Calculation
    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;
    
    if (!width || !height || width <= 0 || height <= 0) {
      width = window.innerWidth || 800;
      height = window.innerHeight || 600;
    }

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    svg.append("style").text(`
      .helix-node, .helix-node circle { pointer-events: auto; }
      line { pointer-events: auto; }
      text { pointer-events: none; }
    `);

    // --- Definitions ---
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const nebulaFilter = defs.append("filter").attr("id", "nebula-blur");
    nebulaFilter.append("feGaussianBlur").attr("stdDeviation", "8");

    const grad = defs.append("radialGradient").attr("id", "orbGrad");
    grad.append("stop").attr("offset", "10%").attr("stop-color", "#fff");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#7B2EFF");

    const gradGold = defs.append("radialGradient").attr("id", "orbGradGold");
    gradGold.append("stop").attr("offset", "10%").attr("stop-color", "#fff");
    gradGold.append("stop").attr("offset", "100%").attr("stop-color", "#FFD700");

    // --- LAYOUT LOGIC ---

    if (layoutMode === 'FORCE') {
      // Force Layout Implementation
      svg.attr("viewBox", [0, 0, width, height]);
      const simulation = forceSimulation(nodes)
        .force("link", forceLink(links).id((d: any) => d.id).distance(100))
        .force("charge", forceManyBody().strength(-300))
        .force("center", forceCenter(width / 2, height / 2));

      const link = svg.append("g").attr("stroke-opacity", 0.3)
        .selectAll("line").data(links).join("line")
        .attr("stroke", "#FFFFFF").attr("stroke-width", 1);

      const node = svg.append("g").selectAll("circle").data(nodes).join("circle")
        .attr("r", (d: any) => d.val)
        .attr("fill", (d: any) => d.group === 1 ? '#FFD700' : '#7B2EFF')
        .attr("stroke", "#fff").attr("stroke-width", 1.5)
        .attr("filter", "url(#glow)")
        .style("cursor", "pointer")
        .on("mouseenter", (event: any, d: any) => {
          isPausedRef.current = true;
          setActiveNode(d);
          setTooltipPos({ x: event.clientX, y: event.clientY });
        })
        .on("mouseleave", () => {
          isPausedRef.current = false;
          setActiveNode(null);
        });

      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
        node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      });

    } else {
      // --- HELIX LAYOUT (Dense DNA) ---
      
      const nebulaGroupA = svg.append("g").attr("class", "nebula-a");
      const nebulaGroupB = svg.append("g").attr("class", "nebula-b");
      const rungsGroup = svg.append("g").attr("class", "rungs");
      const nodesGroup = svg.append("g").attr("class", "nodes");

      // Paths
      const pathA_blur = nebulaGroupA.append("path").attr("fill", "none").attr("stroke", "#FFD700").attr("stroke-width", 30).attr("stroke-opacity", 0.05).attr("filter", "url(#nebula-blur)");
      const pathA_core = nebulaGroupA.append("path").attr("fill", "none").attr("stroke", "#FFD700").attr("stroke-width", 2).attr("stroke-opacity", 0.8);
      
      const pathB_blur = nebulaGroupB.append("path").attr("fill", "none").attr("stroke", "#7B2EFF").attr("stroke-width", 30).attr("stroke-opacity", 0.05).attr("filter", "url(#nebula-blur)");
      const pathB_core = nebulaGroupB.append("path").attr("fill", "none").attr("stroke", "#7B2EFF").attr("stroke-width", 2).attr("stroke-opacity", 0.8);

      // --- 1. DYNAMIC HEIGHT CALCULATION ---
      // Base height is container height, but we grow if there are many nodes.
      // We want roughly 60px per node vertically to give them breathing room.
      const itemsA = helixData.sortedQuestions;
      const itemsB = helixData.sortedObjectives;
      const maxDataCount = Math.max(itemsA.length, itemsB.length, 6); // Min 6 slots
      
      // Dynamic Helix parameters
      const nodeSpacing = 50; 
      const marginY = height * 0.15;
      // If content fits in screen, use screen height * 0.7. Else grow.
      const calculatedHeight = Math.max(height * 0.7, maxDataCount * nodeSpacing);
      const helixHeight = calculatedHeight;
      const startY = (height - helixHeight) / 2; // Center vertically if small, or start top if big

      // --- 2. STRUCTURAL RUNGS (Base Pairs) ---
      // We generate rungs purely for visuals, independent of data nodes.
      // This creates the "ladder" look even if empty.
      const rungSpacing = 20; // Dense rungs
      const numStructuralRungs = Math.floor(helixHeight / rungSpacing);
      const structuralRungsData = Array.from({ length: numStructuralRungs }, (_, i) => ({
        y: startY + i * rungSpacing,
        isStructural: true
      }));

      const structuralRungElements = rungsGroup.selectAll(".struct-rung")
        .data(structuralRungsData)
        .enter().append("line")
        .attr("class", "struct-rung")
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.1); // Subtle background rungs

      // --- 3. DATA NODES ---
      // Map data to specific Y positions. We skip some rungs to spread them out? 
      // Or just map them linearly.
      const renderedNodes: any[] = [];
      
      itemsA.forEach((d, i) => {
        renderedNodes.push({ ...d, helixY: startY + i * (helixHeight / (maxDataCount - 1 || 1)), strand: 'A', group: 1 });
      });
      itemsB.forEach((d, i) => {
        renderedNodes.push({ ...d, helixY: startY + i * (helixHeight / (maxDataCount - 1 || 1)), strand: 'B', group: 2 });
      });

      const nodeElements = nodesGroup.selectAll("g")
        .data(renderedNodes)
        .enter().append("g")
        .attr("class", "helix-node")
        .style("cursor", "pointer")
        .on("mouseenter", (event: any, d: any) => {
          isPausedRef.current = true;
          setActiveNode(d);
          setTooltipPos({ x: event.clientX, y: event.clientY });
        })
        .on("mouseleave", () => {
          isPausedRef.current = false;
          setActiveNode(null);
        });

      nodeElements.append("circle")
        .attr("r", 6)
        .attr("fill", (d: any) => d.strand === 'A' ? "url(#orbGradGold)" : "url(#orbGrad)")
        .attr("filter", "url(#glow)");

      // --- 4. DATA RUNGS (Strong Connections) ---
      // Visual Highlight for actual connections (if indices match, or logic match)
      // For visual simplicity in Helix mode, we often connect index-to-index.
      // Or we can draw lines for actual relationships. 
      // Let's draw visual connectors for the "active" rungs (where data exists on both sides).
      const activeRungLinks: any[] = [];
      for(let i=0; i<Math.min(itemsA.length, itemsB.length); i++) {
        activeRungLinks.push({ 
          source: renderedNodes.find(n => n.id === itemsA[i].id),
          target: renderedNodes.find(n => n.id === itemsB[i].id) 
        });
      }
      
      const activeRungElements = rungsGroup.selectAll(".active-rung")
        .data(activeRungLinks)
        .enter().append("line")
        .attr("class", "active-rung")
        .attr("stroke", "url(#orbGradGold)") // Gold connection
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.6);

      // --- ANIMATION ---
      const freq = (5 * Math.PI) / helixHeight; // 2.5 cycles
      const amp = Math.min(width * 0.2, 140);
      
      const tick = () => {
        if (!isPausedRef.current) rotationRef.current += 0.008;
        const rot = rotationRef.current;
        
        // Helper to get 3D coords
        const getCoords = (y: number, strand: 'A'|'B') => {
          const angle = (y - startY) * freq + rot + (strand === 'B' ? Math.PI : 0);
          const x = (width / 2) + amp * Math.sin(angle);
          const z = Math.cos(angle);
          return { x, y, z };
        };

        // 1. Draw Paths
        const steps = 120;
        const pointsA: [number, number][] = [];
        const pointsB: [number, number][] = [];
        
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const y = startY + t * helixHeight;
          pointsA.push([getCoords(y, 'A').x, y]);
          pointsB.push([getCoords(y, 'B').x, y]);
        }

        const lineGen = line().curve(curveBasis);
        const d_A = lineGen(pointsA as any);
        const d_B = lineGen(pointsB as any);

        if (d_A) { pathA_blur.attr("d", d_A); pathA_core.attr("d", d_A); }
        if (d_B) { pathB_blur.attr("d", d_B); pathB_core.attr("d", d_B); }

        // 2. Update Structural Rungs (The "DNA Ladder" look)
        structuralRungElements
            .attr("x1", (d: any) => getCoords(d.y, 'A').x)
            .attr("y1", (d: any) => d.y)
            .attr("x2", (d: any) => getCoords(d.y, 'B').x)
            .attr("y2", (d: any) => d.y)
            .attr("opacity", (d: any) => {
                const zA = getCoords(d.y, 'A').z;
                // Fade background rungs
                return zA > 0 ? 0.2 : 0.05; 
            });

        // 3. Update Data Nodes
        nodeElements.attr("transform", (d: any) => {
          const c = getCoords(d.helixY, d.strand as 'A'|'B');
          d.currentX = c.x; d.currentY = c.y; d.currentZ = c.z;
          const scale = 0.6 + ((c.z + 1) / 2) * 0.6; 
          return `translate(${c.x},${c.y}) scale(${scale})`;
        })
        .attr("opacity", (d: any) => 0.3 + ((d.currentZ + 1) / 2) * 0.7);

        // 4. Update Active Rungs (Data connections)
        activeRungElements
          .attr("x1", (d: any) => d.source.currentX)
          .attr("y1", (d: any) => d.source.currentY)
          .attr("x2", (d: any) => d.target.currentX)
          .attr("y2", (d: any) => d.target.currentY)
          .attr("opacity", (d: any) => {
             const avgZ = (d.source.currentZ + d.target.currentZ) / 2;
             return Math.max(0.1, (avgZ + 1) / 2.5); 
          });
      };

      const timer = d3Timer(tick);
      return () => timer.stop();
    }
  }, [nodes, links, helixData, layoutMode]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      
      {activeNode && (
        <div 
          className="absolute z-50 pointer-events-none animate-in fade-in zoom-in duration-200"
          style={{ left: tooltipPos.x + 20, top: tooltipPos.y - 40 }}
        >
          <div className="bg-black/80 backdrop-blur-xl border border-white/20 p-4 rounded-2xl w-80 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/20 to-transparent"></div>
             <div className="flex items-center justify-between mb-3">
               <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${activeNode.group === 1 ? 'bg-cosmic-gold/20 text-cosmic-gold' : 'bg-cosmic-purple/20 text-cosmic-purple'}`}>
                 {activeNode.group === 1 ? 'Cognition Node' : 'Action Node'}
               </span>
               <span className="text-[10px] text-gray-500">ID: {activeNode.id}</span>
             </div>
             <h4 className="text-white font-serif text-lg leading-tight mb-2">{activeNode.label}</h4>
             <p className="text-gray-400 text-xs line-clamp-3 mb-4 font-light">{activeNode.content || 'No content available.'}</p>
             {activeNode.assets && activeNode.assets.length > 0 && (
               <div className="mb-4 rounded-lg overflow-hidden border border-white/10 relative">
                 <img src={activeNode.assets[0]} alt="Asset" className="w-full h-32 object-cover opacity-80" />
               </div>
             )}
             <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
               {activeNode.tags?.map(tag => (
                 <span key={tag} className="text-[9px] text-gray-400 px-2 py-0.5 bg-white/5 rounded border border-white/5">#{tag}</span>
               ))}
             </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4 pointer-events-auto">
        <button onClick={() => setLayoutMode('HELIX')} className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${layoutMode === 'HELIX' ? 'bg-white/20 border-white/40 shadow-glow text-white' : 'bg-black/40 border-white/10 text-gray-500'}`}><Dna size={20} /></button>
        <button onClick={() => setLayoutMode('FORCE')} className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${layoutMode === 'FORCE' ? 'bg-white/20 border-white/40 shadow-glow text-white' : 'bg-black/40 border-white/10 text-gray-500'}`}><Network size={20} /></button>
      </div>
    </div>
  );
};