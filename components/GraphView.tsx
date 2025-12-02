
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { select, timer as d3Timer, line, curveBasis } from 'd3';
import { Question, Objective, GraphNode } from '../types';
import { Dna, Network } from 'lucide-react';
import { calculateHelixPoint, calculateHelixDimensions } from '../utils/helixMath';

interface GraphViewProps {
  questions: Question[];
  objectives: Objective[];
}

export const GraphView: React.FC<GraphViewProps> = ({ questions, objectives }) => {
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
    // ... filters ...
    const nebulaFilter = defs.append("filter").attr("id", "nebula-blur");
    nebulaFilter.append("feGaussianBlur").attr("stdDeviation", "6");
    const gradGold = defs.append("radialGradient").attr("id", "orbGradGold");
    gradGold.append("stop").attr("offset", "10%").attr("stop-color", "#fff");
    gradGold.append("stop").attr("offset", "100%").attr("stop-color", "#FFD700");
    const gradPurple = defs.append("radialGradient").attr("id", "orbGradPurple");
    gradPurple.append("stop").attr("offset", "10%").attr("stop-color", "#fff");
    gradPurple.append("stop").attr("offset", "100%").attr("stop-color", "#7B2EFF");

    // Groups
    const nebulaGroup = svg.append("g").attr("class", "nebula");
    const rungsGroup = svg.append("g").attr("class", "rungs");
    const nodesGroup = svg.append("g").attr("class", "nodes");

    // Paths
    const pathA_blur = nebulaGroup.append("path").attr("stroke", "#FFD700").attr("stroke-width", 20).attr("stroke-opacity", 0.1).attr("fill", "none").attr("filter", "url(#nebula-blur)");
    const pathA_core = nebulaGroup.append("path").attr("stroke", "#FFD700").attr("stroke-width", 2).attr("stroke-opacity", 0.8).attr("fill", "none");
    const pathB_blur = nebulaGroup.append("path").attr("stroke", "#7B2EFF").attr("stroke-width", 20).attr("stroke-opacity", 0.1).attr("fill", "none").attr("filter", "url(#nebula-blur)");
    const pathB_core = nebulaGroup.append("path").attr("stroke", "#7B2EFF").attr("stroke-width", 2).attr("stroke-opacity", 0.8).attr("fill", "none");

    // 3. Helix Parameters using Logic Layer
    const maxDataCount = Math.max(itemsA.length, itemsB.length, 6);
    const { height: helixHeight, startY } = calculateHelixDimensions(height, maxDataCount);

    // 4. Render Nodes
    const renderedNodes: any[] = [];
    const createNodeData = (items: any[], strand: 'A'|'B', group: number) => {
      items.forEach((d, i) => {
        // Map linearly along helix height
        const yBase = startY + i * (helixHeight / (maxDataCount - 1 || 1));
        renderedNodes.push({ ...d, yBase, strand, group });
      });
    };
    createNodeData(itemsA, 'A', 1);
    createNodeData(itemsB, 'B', 2);

    const nodeElements = nodesGroup.selectAll("g")
      .data(renderedNodes)
      .enter().append("g")
      .style("cursor", "pointer")
      .on("mouseenter", (e: any, d: any) => {
        isPausedRef.current = true;
        setActiveNode(d);
        setTooltipPos({ x: e.clientX, y: e.clientY });
      })
      .on("mouseleave", () => {
        isPausedRef.current = false;
        setActiveNode(null);
      });

    nodeElements.append("circle")
      .attr("r", 5)
      .attr("fill", (d: any) => d.strand === 'A' ? "url(#orbGradGold)" : "url(#orbGradPurple)");

    // 5. Structural Rungs
    const rungSpacing = 15; // Dense rungs
    const numRungs = Math.floor(helixHeight / rungSpacing);
    const rungsData = Array.from({length: numRungs}, (_, i) => ({ yBase: startY + i * rungSpacing }));
    
    const rungElements = rungsGroup.selectAll("line")
      .data(rungsData).enter().append("line")
      .attr("stroke", "white").attr("stroke-width", 0.5);

    // 6. Animation Loop
    const tick = () => {
      if (!isPausedRef.current) rotationRef.current += 0.01;
      const rot = rotationRef.current;

      // Update Rungs
      rungElements
        .attr("x1", (d: any) => calculateHelixPoint(d.yBase, 'A', rot, width, startY, helixHeight).x)
        .attr("y1", (d: any) => calculateHelixPoint(d.yBase, 'A', rot, width, startY, helixHeight).y)
        .attr("x2", (d: any) => calculateHelixPoint(d.yBase, 'B', rot, width, startY, helixHeight).x)
        .attr("y2", (d: any) => calculateHelixPoint(d.yBase, 'B', rot, width, startY, helixHeight).y)
        .attr("opacity", (d: any) => {
           const z = calculateHelixPoint(d.yBase, 'A', rot, width, startY, helixHeight).z;
           return z > 0 ? 0.2 : 0.05; // Fade background rungs
        });

      // Update Nodes
      nodeElements.attr("transform", (d: any) => {
        const p = calculateHelixPoint(d.yBase, d.strand, rot, width, startY, helixHeight);
        const scale = 0.5 + ((p.z + 1) / 2) * 0.5;
        return `translate(${p.x},${p.y}) scale(${scale})`;
      }).attr("opacity", (d: any) => {
        const z = calculateHelixPoint(d.yBase, d.strand, rot, width, startY, helixHeight).z;
        return 0.3 + ((z + 1) / 2) * 0.7;
      });

      // Update Paths
      const steps = 100;
      const pointsA: [number, number][] = [];
      const pointsB: [number, number][] = [];
      for(let i=0; i<=steps; i++) {
        const t = i/steps;
        const y = startY + t * helixHeight;
        const pA = calculateHelixPoint(y, 'A', rot, width, startY, helixHeight);
        const pB = calculateHelixPoint(y, 'B', rot, width, startY, helixHeight);
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

  }, [itemsA, itemsB]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      {/* Tooltip rendering omitted for brevity, assumes same as before */}
    </div>
  );
};
