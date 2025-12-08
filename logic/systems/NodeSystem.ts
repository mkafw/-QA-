
import * as d3 from 'd3';
import { SceneLayers } from './SceneSystem';
import { GraphNode } from '../../types';
import { HelixPoint } from '../../utils/helixMath';

interface NodeInteractions {
    onHover: (e: any, d: GraphNode) => void;
    onLeave: (e: any, d: GraphNode) => void;
    onClick: (e: any, d: GraphNode) => void;
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
        const nodes = this.layers.nodes.selectAll("g").data(nodesData, (d: any) => d.id);
        nodes.exit().remove();
        
        // Enter Phase
        const nodesEnter = nodes.enter().append("g")
            .style("cursor", "pointer")
            .style("pointer-events", "all")
            .on("mouseenter", (e, d) => this.callbacks.onHover(e, d))
            .on("mouseleave", (e, d) => this.callbacks.onLeave(e, d))
            .on("click", (e, d) => this.callbacks.onClick(e, d));

        this.appendNodeVisuals(nodesEnter);

        // Update Phase
        const nodesUpdate = nodesEnter.merge(nodes as any);
        
        // Calculate Positions & Z-Index
        nodesUpdate.each(function(d: any) {
            const p = projectionFn(d.index, d.strand);
            d._pos = p;
            d3.select(this).attr("transform", `translate(${p.x},${p.y})`);
        });

        // Update Visual Styles
        this.updateStyles(nodesUpdate, recentNodeIds, activeNodeId, selectedNodeId);
        
        // Z-Index Sorting
        nodesUpdate.sort((a: any, b: any) => a._pos.z - b._pos.z);
    }

    private appendNodeVisuals(enterSelection: d3.Selection<SVGGElement, GraphNode, d3.BaseType, unknown>) {
        // Hit Area
        enterSelection.append("circle")
            .attr("class", "hit-area")
            .attr("r", 20)
            .attr("fill", "transparent")
            .attr("stroke", "none");

        // Halo
        enterSelection.append("circle").attr("class", "halo");
        
        // Core
        enterSelection.append("circle").attr("class", "core");

        // Label
        enterSelection.append("text")
             .attr("class", "label")
             .attr("dy", -15)
             .attr("text-anchor", "middle")
             .style("fill", "white")
             .style("font-size", "10px")
             .style("font-family", "sans-serif")
             .style("pointer-events", "none")
             .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)");
    }

    private updateStyles(
        selection: d3.Selection<SVGGElement, GraphNode, d3.BaseType, unknown>,
        recentIds: Set<string>,
        activeId: string | null,
        selectedId: string | null
    ) {
        // Halo Style
        selection.select(".halo")
            .attr("r", 8)
            .attr("fill", (d: any) => {
                const isRecent = recentIds.has(d.id);
                if (!isRecent) return "url(#orbGradDark)";
                return d.strand === 'A' ? "url(#orbGradGold)" : "url(#orbGradPurple)";
            })
            .attr("stroke", (d: any) => recentIds.has(d.id) ? "#FFFFFF" : "#444")
            .attr("stroke-width", (d: any) => recentIds.has(d.id) ? 1 : 0.5);

        // Core Style
        selection.select(".core")
            .attr("r", (d: any) => recentIds.has(d.id) ? 3 : 2)
            .attr("fill", (d: any) => recentIds.has(d.id) ? "#FFFFFF" : "#555");

        // Label Text
        selection.select(".label")
            .text((d: any) => d.label.length > 15 ? d.label.substring(0, 12) + "..." : d.label)
            .attr("opacity", (d: any) => {
                const isSelected = selectedId === d.id;
                const isRecent = recentIds.has(d.id);
                const isActive = activeId === d.id;
                
                if (isActive || isSelected) return 1;
                if (isRecent) return 0.8;
                return 0; // Hide cluttered labels
            });

        // Global Scale & Opacity based on Depth (Z)
        selection
            .attr("transform", (d: any) => {
                const p = d._pos;
                const scale = 0.5 + ((p.z + 1) / 2) * 0.7; 
                return `translate(${p.x},${p.y}) scale(${scale})`;
            })
            .attr("opacity", (d: any) => {
                 const isSelected = selectedId === d.id;
                 const isRecent = recentIds.has(d.id);
                 if (isSelected || isRecent) return 1.0;
                 // Fade out dark points
                 const zNorm = (d._pos.z + 1) / 2;
                 return 0.2 + (0.5 * zNorm);
            });
    }
}
