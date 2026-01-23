
import * as d3 from 'd3';
import { SceneLayers } from './SceneSystem';
import { GraphNode, HelixStep } from '../../types';
import { HelixPoint, calculateHelixPoint } from '../../utils/helixMath';

export class StructureSystem {
    private layers: SceneLayers;

    constructor(layers: SceneLayers) {
        this.layers = layers;
        this.initializeStrandPaths();
    }

    private initializeStrandPaths() {
        // 1. Create Base Tube (Color)
        const createStrandPath = (group: any, id: string, color: string, isFront: boolean) => {
            const path = group.append("path")
                .attr("id", id)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", isFront ? 3 : 2) // Thicker front strands
                .attr("stroke-linecap", "round");
            
            if (isFront) {
                // Apply the Neon Glow filter defined in SceneSystem
                path.attr("filter", "url(#glow)");
            }
            return path;
        };

        // 2. Create Pulse Highlight (White Energy)
        const createPulsePath = (group: any, id: string) => {
            return group.append("path")
                .attr("id", id)
                .attr("class", "helix-pulse") // CSS animation handles the flow
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-width", 2) // Slightly thinner than the tube
                .attr("stroke-linecap", "round")
                .attr("opacity", 0.9);
        };

        // Back Strands (No Pulse)
        createStrandPath(this.layers.backStrands, "pathABack", "#FFE580", false);
        createStrandPath(this.layers.backStrands, "pathBBack", "#7B2EFF", false);

        // Front Strands (With Glow)
        createStrandPath(this.layers.frontStrands, "pathAFront", "#FFE580", true);
        createStrandPath(this.layers.frontStrands, "pathBFront", "#7B2EFF", true);

        // Pulse Strands (The Highlights)
        createPulsePath(this.layers.pulseStrands, "pulseA");
        createPulsePath(this.layers.pulseStrands, "pulseB");
    }

    public render(
        steps: HelixStep[], 
        links: any[], 
        allNodes: GraphNode[], 
        recentNodeIds: Set<string>, 
        activeNodeId: string | null,
        selectedNodeId: string | null,
        projectionFn: (idx: number, strand: 'A'|'B') => HelixPoint,
        helixParams: { startY: number, stepSpacing: number, width: number, height: number, rotation: number }
    ) {
        this.renderIntervals(steps, recentNodeIds, projectionFn);
        this.renderSynapses(links, allNodes, activeNodeId, selectedNodeId, projectionFn);
        this.renderStrands(steps, helixParams);
    }

    private renderIntervals(steps: HelixStep[], recentIds: Set<string>, getPoint: (idx: number, s: 'A'|'B') => HelixPoint) {
        const intervals = this.layers.intervals.selectAll("path").data(steps);
        intervals.exit().remove();
        intervals.enter().append("path")
            .merge(intervals as any)
            .attr("fill", "none")
            .attr("stroke-linecap", "round")
            .attr("d", (d: any) => {
                const step = d as HelixStep;
                const qGhost = !step.question || step.question.isGhost;
                const oGhost = !step.objective || step.objective.isGhost;
                if (qGhost && oGhost) return "";

                const pA = getPoint(step.index, 'A');
                const pB = getPoint(step.index, 'B');
                const midX = (pA.x + pB.x) / 2;
                const midY = (pA.y + pB.y) / 2;
                const dist = Math.sqrt(Math.pow(pA.x - pB.x, 2) + Math.pow(pA.y - pB.y, 2));
                const curveOffset = dist * 0.3; 
                return `M${pA.x},${pA.y} Q${midX},${midY - curveOffset} ${pB.x},${pB.y}`;
            })
            .attr("stroke", (d: any) => {
                const step = d as HelixStep;
                if (step.question?.isCrystallized || step.objective?.isCrystallized) return "#FFE580";
                const isActive = (step.question && recentIds.has(step.question.id)) || 
                                 (step.objective && recentIds.has(step.objective.id));
                return isActive ? "#FFE580" : "#555566";
            })
            .attr("stroke-width", (d: any) => {
                 const step = d as HelixStep;
                 const pA = getPoint(step.index, 'A');
                 const zNorm = (pA.z + 1) / 2;
                 return 0.5 + (2 * zNorm);
            })
            .attr("opacity", (d: any) => {
                const step = d as HelixStep;
                const pA = getPoint(step.index, 'A');
                const zNorm = (pA.z + 1) / 2;
                return 0.2 + (0.8 * zNorm);
            });
    }

    private renderSynapses(
        links: any[], 
        allNodes: GraphNode[], 
        activeId: string|null, 
        selectedId: string|null,
        getPoint: (idx: number, s: 'A'|'B') => HelixPoint
    ) {
        const synapseLinks = this.layers.synapses.selectAll("path").data(links);
        synapseLinks.exit().remove();
        synapseLinks.enter().append("path")
            .merge(synapseLinks as any)
            .attr("fill", "none")
            .attr("stroke-dasharray", (d: any) => d.type === 'MUTATION' ? "1 4" : "2 4")
            .attr("stroke-linecap", "round")
            .attr("d", (d: any) => {
                const sourceStep = allNodes.find(n => n.id === d.source.id)?.index ?? 0;
                const targetStep = allNodes.find(n => n.id === d.target.id)?.index ?? 0;
                
                const ps = getPoint(sourceStep, d.source.strand as any);
                const pt = getPoint(targetStep, d.target.strand as any);
                
                if (d.type === 'MUTATION') {
                     const midX = (ps.x + pt.x) / 2 + (Math.random() * 50 - 25);
                     const midY = (ps.y + pt.y) / 2;
                     return `M${ps.x},${ps.y} Q${midX},${midY} ${pt.x},${pt.y}`;
                }

                const midY = (ps.y + pt.y) / 2;
                const midX = (ps.x + pt.x) / 2;
                return `M${ps.x},${ps.y} Q${midX},${midY} ${pt.x},${pt.y}`;
            })
            .attr("stroke", (d: any) => d.type === 'MUTATION' ? "#FF2E5B" : "#AACCFF")
            .attr("stroke-width", 1.5)
            .attr("opacity", (d: any) => {
                 if (d.type === 'MUTATION') return 0.6;
                 const focusId = activeId || selectedId;
                 if (focusId) {
                     if (d.source.id === focusId || d.target.id === focusId) return 0.9;
                     return 0.1; 
                 }
                 return 0; 
            });
    }

    private renderStrands(steps: HelixStep[], params: { startY: number, stepSpacing: number, rotation: number, width: number, height: number }) {
        const lineGen = d3.line().curve(d3.curveCardinal);
        const pointsA: [number, number][] = [];
        const pointsB: [number, number][] = [];
        const samples = steps.length * 4; 
        
        for(let i=0; i<=samples; i++) {
             const y = params.startY + (i / samples) * (steps.length * params.stepSpacing);
             const pA = calculateHelixPoint(y, 'A', params.rotation, params.width, params.startY, params.height);
             const pB = calculateHelixPoint(y, 'B', params.rotation, params.width, params.startY, params.height);
             pointsA.push([pA.x, pA.y]);
             pointsB.push([pB.x, pB.y]);
        }
        
        const d_A = lineGen(pointsA);
        const d_B = lineGen(pointsB);

        // Update Base Tubes
        if (d_A) {
            this.layers.frontStrands.select("#pathAFront").attr("d", d_A).attr("opacity", 1);
            this.layers.backStrands.select("#pathABack").attr("d", d_A).attr("opacity", 0.2);
            // Update Pulse Highlight A
            this.layers.pulseStrands.select("#pulseA").attr("d", d_A);
        }
        
        if (d_B) {
            this.layers.frontStrands.select("#pathBFront").attr("d", d_B).attr("opacity", 1);
            this.layers.backStrands.select("#pathBBack").attr("d", d_B).attr("opacity", 0.2);
            // Update Pulse Highlight B
            this.layers.pulseStrands.select("#pulseB").attr("d", d_B);
        }
    }
}
