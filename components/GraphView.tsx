import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Question, Objective, GraphNode, GraphLink } from '../types';
import { Network, Dna } from 'lucide-react';

interface GraphViewProps {
  questions: Question[];
  objectives: Objective[];
}

export const GraphView: React.FC<GraphViewProps> = ({ questions, objectives }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutMode, setLayoutMode] = useState<'HELIX' | 'FORCE'>('HELIX');
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number | null>(null);

  const { nodes, links, helixData } = useMemo(() => {
    const rawNodes: GraphNode[] = [];
    const rawLinks: GraphLink[] = [];
    
    questions.forEach(q => {
      rawNodes.push({ id: q.id, group: 1, label: q.title, level: q.level, val: 5 + (q.level * 2) });
      q.linkedQuestionIds.forEach(targetId => rawLinks.push({ source: q.id, target: targetId, type: 'related' }));
    });

    objectives.forEach(o => {
      rawNodes.push({ id: o.id, group: 2, label: o.title, val: 12 });
      o.linkedQuestionIds.forEach(qid => rawLinks.push({ source: o.id, target: qid, type: 'supports' }));
      o.keyResults.forEach(kr => {
        rawNodes.push({ id: kr.id, group: 3, label: kr.title, val: 8 });
        rawLinks.push({ source: o.id, target: kr.id, type: 'related' });
      });
    });

    const sortedQuestions = [...questions].sort((a, b) => a.level - b.level);
    const sortedObjectives = [...objectives].sort((a, b) => a.id.localeCompare(b.id));

    return { nodes: rawNodes, links: rawLinks, helixData: { sortedQuestions, sortedObjectives } };
  }, [questions, objectives]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define Glow and Gradient Filters
    const defs = svg.append("defs");
    
    // Standard Glow
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Nebula Blur (Stronger)
    const nebulaFilter = defs.append("filter").attr("id", "nebula-blur");
    nebulaFilter.append("feGaussianBlur").attr("stdDeviation", "8");

    // Node Gradients
    const grad = defs.append("radialGradient").attr("id", "orbGrad");
    grad.append("stop").attr("offset", "10%").attr("stop-color", "#fff");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#7B2EFF"); // Purple

    const gradGold = defs.append("radialGradient").attr("id", "orbGradGold");
    gradGold.append("stop").attr("offset", "10%").attr("stop-color", "#fff");
    gradGold.append("stop").attr("offset", "100%").attr("stop-color", "#FFD700"); // Gold

    if (layoutMode === 'FORCE') {
      renderForceGraph(svg, width, height, nodes, links);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      renderHelixGraph(svg, width, height, helixData, links);
    }

    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [layoutMode, nodes, links, helixData, rotation]);

  useEffect(() => {
    if (layoutMode === 'HELIX') {
      const animate = () => {
        setRotation(prev => (prev + 0.003) % (Math.PI * 2));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [layoutMode]);

  // --- Renderers ---

  const renderForceGraph = (svg: any, width: number, height: number, nodes: any[], links: any[]) => {
    svg.attr("viewBox", [0, 0, width, height]);
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    svg.append("g").attr("stroke-opacity", 0.3)
      .selectAll("line").data(links).join("line")
      .attr("stroke", "#FFFFFF").attr("stroke-width", 1);

    const node = svg.append("g").selectAll("circle").data(nodes).join("circle")
      .attr("r", (d: any) => d.val)
      .attr("fill", (d: any) => d.group === 1 ? '#FFD700' : '#7B2EFF')
      .attr("stroke", "#fff").attr("stroke-width", 1.5)
      .attr("filter", "url(#glow)");

    simulation.on("tick", () => {
      svg.selectAll("line")
        .attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    });
  };

  const renderHelixGraph = (svg: any, width: number, height: number, data: any, allLinks: any[]) => {
    // Adjusted scaling for full screen view
    const startY = height - 100; const endY = 100; 
    const helixRadius = Math.min(width, height) * 0.25; // Dynamic radius based on screen size
    
    // 3D Projection Helper
    const project = (x: number, y: number, z: number) => {
      const scale = 1000 / (1000 + z); 
      return { x: width / 2 + x * scale, y: y, scale, z }; 
    };

    const steps = 120; // High resolution for smooth nebula curves
    const pointsA = [];
    const pointsB = [];

    // Calculate Helix Paths
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const y = startY - (p * (startY - endY));
      
      // Strand A
      const angleA = (p * 4 * Math.PI) + rotation;
      pointsA.push(project(Math.cos(angleA) * helixRadius, y, Math.sin(angleA) * helixRadius));

      // Strand B (180 degrees offset)
      const angleB = angleA + Math.PI;
      pointsB.push(project(Math.cos(angleB) * helixRadius, y, Math.sin(angleB) * helixRadius));
    }

    const lineGen = d3.line<any>().curve(d3.curveBasis).x(d => d.x).y(d => d.y);

    // --- Draw The Middle Bars (Base Pairs) ---
    // Drawn first to be "inside" the nebula
    const rungs = [];
    for(let i=0; i<steps; i+=3) {
      rungs.push({ a: pointsA[i], b: pointsB[i] });
    }
    
    svg.selectAll(".rung").data(rungs).join("line")
      .attr("x1", (d: any) => d.a.x).attr("y1", (d: any) => d.a.y)
      .attr("x2", (d: any) => d.b.x).attr("y2", (d: any) => d.b.y)
      .attr("stroke", "white")
      .attr("stroke-opacity", 0.15)
      .attr("stroke-width", 1);


    // --- Draw Strands (Nebula Effect) ---
    
    // Strand A: Gold Nebula
    // Layer 1: Wide, faint atmosphere
    svg.append("path").datum(pointsA).attr("d", lineGen)
       .attr("fill", "none").attr("stroke", "#FFD700").attr("stroke-width", 30).attr("stroke-opacity", 0.05).attr("filter", "url(#nebula-blur)");
    // Layer 2: Medium glow
    svg.append("path").datum(pointsA).attr("d", lineGen)
       .attr("fill", "none").attr("stroke", "#FFD700").attr("stroke-width", 8).attr("stroke-opacity", 0.2).attr("filter", "url(#glow)");
    // Layer 3: Core wire
    svg.append("path").datum(pointsA).attr("d", lineGen)
       .attr("fill", "none").attr("stroke", "#FFD700").attr("stroke-width", 1.5).attr("stroke-opacity", 0.9);

    // Strand B: Purple Nebula
    // Layer 1: Wide atmosphere
    svg.append("path").datum(pointsB).attr("d", lineGen)
       .attr("fill", "none").attr("stroke", "#7B2EFF").attr("stroke-width", 30).attr("stroke-opacity", 0.05).attr("filter", "url(#nebula-blur)");
    // Layer 2: Medium glow
    svg.append("path").datum(pointsB).attr("d", lineGen)
       .attr("fill", "none").attr("stroke", "#7B2EFF").attr("stroke-width", 8).attr("stroke-opacity", 0.2).attr("filter", "url(#glow)");
    // Layer 3: Core wire
    svg.append("path").datum(pointsB).attr("d", lineGen)
       .attr("fill", "none").attr("stroke", "#7B2EFF").attr("stroke-width", 1.5).attr("stroke-opacity", 0.9);


    // --- Draw Nodes (Orbs) ---
    const items = [...data.sortedQuestions.map((d: any, i: number) => ({...d, isQ: true, idx: i, total: data.sortedQuestions.length})), 
                   ...data.sortedObjectives.map((d: any, i: number) => ({...d, isQ: false, idx: i, total: data.sortedObjectives.length}))];
    
    const projectedNodes = items.map(item => {
      const p = item.idx / Math.max(item.total -1, 1);
      const angle = (p * 4 * Math.PI) + rotation + (item.isQ ? 0 : Math.PI);
      const y = startY - (p * (startY - endY));
      const coords = project(Math.cos(angle) * helixRadius, y, Math.sin(angle) * helixRadius);
      return { ...item, ...coords };
    }).sort((a, b) => a.z - b.z);

    const nodesSel = svg.selectAll(".node").data(projectedNodes).join("g")
       .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`);

    nodesSel.append("circle")
       .attr("r", (d: any) => (d.isQ ? 6 : 9) * d.scale)
       .attr("fill", (d: any) => d.isQ ? "url(#orbGradGold)" : "url(#orbGrad)")
       .attr("filter", "drop-shadow(0 0 8px rgba(255,255,255,0.6))");
       
    nodesSel.filter((d: any) => d.scale > 0.8).append("text")
       .text((d: any) => d.title.substring(0, 15))
       .attr("dx", 14).attr("dy", 4)
       .attr("fill", "white").attr("opacity", 0.9).attr("font-size", 10).attr("font-family", "Inter")
       .style("text-shadow", "0 0 5px rgba(0,0,0,0.8)");
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4 z-20">
           <button onClick={() => setLayoutMode('HELIX')} className={`p-3 rounded-full backdrop-blur-xl border transition-all ${layoutMode === 'HELIX' ? 'bg-white/20 border-white/60 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black/40 border-white/10 text-gray-500 hover:bg-white/10'}`}><Dna size={22}/></button>
           <button onClick={() => setLayoutMode('FORCE')} className={`p-3 rounded-full backdrop-blur-xl border transition-all ${layoutMode === 'FORCE' ? 'bg-white/20 border-white/60 text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black/40 border-white/10 text-gray-500 hover:bg-white/10'}`}><Network size={22}/></button>
        </div>

        <svg ref={svgRef} className="w-full h-full block"></svg>
    </div>
  );
};