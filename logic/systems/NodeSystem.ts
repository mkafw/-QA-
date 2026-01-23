
import * as d3 from 'd3';
import { SceneLayers } from './SceneSystem';
import { GraphNode } from '../../types';
import { HelixPoint } from '../../utils/helixMath';

interface NodeInteractions {
    onHover: (e: MouseEvent, d: GraphNode) => void;
    onLeave: (e: MouseEvent, d: GraphNode) => void;
    onClick: (e: MouseEvent, d: GraphNode) => void;
}

export class NodeSystem {
    private layers: SceneLayers;
    private callbacks: NodeInteractions;

    constructor(layers: SceneLayers, callbacks: NodeInteractions) {
        this.layers = layers;
        this.callbacks = callbacks;
    }

    public render(
        nodesData: GraphNode[], 
        recentNodeIds: Set<string>,
        activeNodeId: string | null,
        selectedNodeId: string | null,
        projectionFn: (idx: number, strand: 'A'|'B') => HelixPoint
    ) {
        // Data Join
        const nodes = this.layers.nodes.selectAll<SVGGElement, GraphNode>("g")
            .data(nodesData, (d) => d.id);
        
        nodes.exit().remove();
        
        // Enter
        const nodesEnter = nodes.enter().append("g")
            .attr("class", "node-group")
            .style("cursor", (d) => d.isGhost ? "default" : "pointer")
            .style("pointer-events", "all")
            .on("mouseenter", (e, d) => this.callbacks.onHover(e, d))
            .on("mouseleave", (e, d) => this.callbacks.onLeave(e, d))
            .on("click", (e, d) => this.callbacks.onClick(e, d));

        this.appendNodeVisuals(nodesEnter);

        // Update
        const nodesUpdate = nodesEnter.merge(nodes);
        
        // 1. Position
        nodesUpdate.each(function(d) {
            const p = projectionFn(d.index!, d.strand);
            Object.assign(d, { _pos: p });
            d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
        });

        // 2. Styles (Entropy & Crystallization Logic)
        this.updateStyles(nodesUpdate, recentNodeIds, activeNodeId, selectedNodeId);
        
        // 3. Sort (Crucial for depth perception)
        nodesUpdate.sort((a: any, b: any) => a._pos.z - b._pos.z);
    }

    private appendNodeVisuals(enterSelection: d3.Selection<SVGGElement, GraphNode, any, any>) {
        enterSelection.append("circle")
            .attr("class", "hit-area")
            .attr("r", 20)
            .attr("fill", "transparent");

        // Outer Halo (Glow)
        enterSelection.append("circle").attr("class", "halo");
        // Inner Core (Solid)
        enterSelection.append("circle").attr("class", "core");
        // Text Label
        enterSelection.append("text")
             .attr("class", "label")
             .attr("dy", -15)
             .attr("text-anchor", "middle")
             .style("fill", "white")
             .style("font-size", "10px")
             .style("font-family", "JetBrains Mono, monospace")
             .style("pointer-events", "none")
             .style("text-shadow", "0 0 4px rgba(0,0,0,1)");
    }

    private updateStyles(
        selection: d3.Selection<SVGGElement, GraphNode, any, any>,
        recentIds: Set<string>,
        activeId: string | null,
        selectedId: string | null
    ) {
        const now = new Date().getTime();

        // Halo Style
        selection.select(".halo")
            .attr("r", (d) => {
                if (d.isGhost) return 3;
                if (d.id === activeId) return 14; // Pulse effect on hover
                return 8;
            })
            .attr("fill", (d) => {
                if (d.isGhost) return "none";
                const isRecent = recentIds.has(d.id);
                // LAW OF CRYSTALLIZATION: Gold glow overrides everything
                if (d.isCrystallized) return "url(#orbGradGold)";
                if (d.id === activeId || isRecent) {
                     return d.strand === 'A' ? "url(#orbGradGold)" : "url(#orbGradPurple)";
                }
                return "url(#orbGradDark)";
            })
            .attr("stroke", (d) => {
                if (d.isGhost) return "#333";
                if (d.isCrystallized) return "#FFE580";
                return (recentIds.has(d.id) || activeId === d.id) ? "#FFFFFF" : "#555";
            })
            .attr("stroke-width", (d) => {
                if (d.isGhost) return 1;
                return (d.isCrystallized || recentIds.has(d.id) || activeId === d.id) ? 1.5 : 0.5;
            })
            .attr("opacity", (d) => {
                if (d.isGhost) return 0.2;
                if (d.isCrystallized || activeId === d.id) return 1;
                return recentIds.has(d.id) ? 0.9 : 0.5;
            });

        // Core Style
        selection.select(".core")
            .attr("r", (d) => d.isGhost ? 0 : (activeId === d.id ? 4 : 2.5))
            .attr("fill", (d) => {
                if (d.isCrystallized) return "#FFE580";
                if (d.strand === 'A') return "#FFF"; // Questions are white hot
                return "#E0E0FF"; // Objectives are cool white
            });

        // Label
        selection.select(".label")
            .text((d) => d.isGhost ? "" : (d.label.length > 15 ? d.label.substring(0, 12) + "..." : d.label))
            .attr("opacity", (d) => {
                const isSelected = selectedId === d.id;
                const isActive = activeId === d.id;
                
                // Show label on hover/select
                if (isActive || isSelected) return 1;
                
                // Show label if crystallized and in front
                if (d.isCrystallized && d._pos.z > -0.2) return 0.9;
                
                // Show recent
                if (recentIds.has(d.id) && d._pos.z > -0.5) return 0.8;
                
                return 0;
            })
            .style("font-weight", (d) => (activeId === d.id ? "bold" : "normal"));

        // Global Scale & Opacity (Entropy + Depth)
        selection
            .attr("transform", function(d: any) {
                const p = d._pos;
                // Exaggerate scale for depth perception
                const scale = 0.4 + ((p.z + 1) / 2) * 0.8; 
                return `translate(${p.x},${p.y}) scale(${scale})`;
            })
            .attr("opacity", (d: any) => {
                 const isSelected = selectedId === d.id;
                 const isActive = activeId === d.id;
                 
                 // LAW OF ENTROPY: Calculate age decay
                 let entropyFactor = 1;
                 if (d.rawEntity?.updatedAt) {
                    const daysOld = (now - new Date(d.rawEntity.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
                    // Decay after 14 days, min 0.3
                    if (daysOld > 14) entropyFactor = Math.max(0.3, 1 - (daysOld - 14)/60);
                 }

                 if (d.isGhost) return 0.1;
                 if (isActive || isSelected) return 1.0;
                 if (d.isCrystallized) return 1.0; 
                 
                 const zNorm = (d._pos.z + 1) / 2;
                 // Sharper depth falloff: things in back are very dim
                 return (0.1 + (0.9 * zNorm)) * entropyFactor; 
            });
    }
}
