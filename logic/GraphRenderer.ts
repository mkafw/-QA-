
import * as d3 from 'd3';
import { GraphNode } from '../types';
import { calculateHelixPoint, calculateHelixDimensions } from '../utils/helixMath';

interface RendererOptions {
    container: HTMLDivElement;
    svgElement: SVGSVGElement;
    onNodeHover: (node: GraphNode | null, x: number, y: number) => void;
    onNodeClick: (node: GraphNode, isShiftKey: boolean) => void;
    onBackgroundClick: () => void;
}

interface HelixStep {
    index: number;
    question?: GraphNode;
    objective?: GraphNode;
}

export class GraphRenderer {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private width: number = 800;
    private height: number = 600;
    private rotation: number = 0;
    private velocity: number = 0.005;
    private isDragging: boolean = false;
    private isPaused: boolean = false;
    private timer: d3.Timer | null = null;
    
    // Data Store
    private steps: HelixStep[] = [];
    private allNodes: GraphNode[] = [];
    private links: any[] = [];
    private recentNodeIds: Set<string> = new Set();
    private activeNodeId: string | null = null;
    private selectedNodeId: string | null = null;

    // Elements
    private layers: {
        defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
        backStrands: d3.Selection<SVGGElement, unknown, null, undefined>;
        intervals: d3.Selection<SVGGElement, unknown, null, undefined>;
        synapses: d3.Selection<SVGGElement, unknown, null, undefined>;
        nodes: d3.Selection<SVGGElement, unknown, null, undefined>;
        frontStrands: d3.Selection<SVGGElement, unknown, null, undefined>;
    };

    // Callbacks
    private callbacks: RendererOptions;

    constructor(options: RendererOptions) {
        this.callbacks = options;
        this.svg = d3.select(options.svgElement);
        
        // Setup Layers
        this.svg.selectAll("*").remove();
        const defs = this.svg.append("defs");
        const mainGroup = this.svg.append("g");

        this.layers = {
            defs: defs,
            backStrands: mainGroup.append("g").attr("class", "back-strands"),
            intervals: mainGroup.append("g").attr("class", "intervals"),
            synapses: mainGroup.append("g").attr("class", "synapses"),
            nodes: mainGroup.append("g").attr("class", "nodes"),
            frontStrands: mainGroup.append("g").attr("class", "front-strands"),
        };

        this.initializeFilters(defs);
        this.initializeInteraction(options.container);
    }

    private initializeFilters(defs: d3.Selection<SVGDefsElement, unknown, null, undefined>) {
        // Glow Filter
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Bright Orbs (Active) - The "Light" Points
        const gradGold = defs.append("radialGradient").attr("id", "orbGradGold").attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
        gradGold.append("stop").attr("offset", "0%").attr("stop-color", "#FFF");
        gradGold.append("stop").attr("offset", "40%").attr("stop-color", "#FFE580");
        gradGold.append("stop").attr("offset", "100%").attr("stop-color", "rgba(255, 229, 128, 0)");
        
        const gradPurple = defs.append("radialGradient").attr("id", "orbGradPurple").attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
        gradPurple.append("stop").attr("offset", "0%").attr("stop-color", "#FFF");
        gradPurple.append("stop").attr("offset", "40%").attr("stop-color", "#D8B4FE");
        gradPurple.append("stop").attr("offset", "100%").attr("stop-color", "rgba(123, 46, 255, 0)");

        // Dark Orbs (Inactive/Old) - The "Dark" Points (Dark Matter)
        const gradDark = defs.append("radialGradient").attr("id", "orbGradDark").attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
        gradDark.append("stop").attr("offset", "0%").attr("stop-color", "#555");
        gradDark.append("stop").attr("offset", "60%").attr("stop-color", "#222");
        gradDark.append("stop").attr("offset", "100%").attr("stop-color", "rgba(0,0,0,0)");
    }

    private initializeInteraction(container: HTMLDivElement) {
        let lastX = 0;

        d3.select(container)
            .on("mousedown", (e) => {
                this.isDragging = true;
                lastX = e.clientX;
                container.style.cursor = "grabbing";
            })
            .on("mousemove", (e) => {
                if (!this.isDragging) return;
                const delta = e.clientX - lastX;
                this.rotation += delta * 0.005;
                lastX = e.clientX;
                this.velocity = delta * 0.001;
            })
            .on("mouseup", () => {
                this.isDragging = false;
                container.style.cursor = "grab";
                this.velocity = 0.005; // Return to orbit
            })
            .on("mouseleave", () => {
                this.isDragging = false;
                this.velocity = 0.005;
            })
            .on("click", (e) => {
                // Background click
                if (e.target === container) {
                    this.selectedNodeId = null;
                    this.callbacks.onBackgroundClick();
                }
            });
    }

    public updateDimensions(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public updateData(steps: HelixStep[], allNodes: GraphNode[], links: any[], recentIds: Set<string>) {
        this.steps = steps;
        this.allNodes = allNodes;
        this.links = links;
        this.recentNodeIds = recentIds;
        this.renderStatic();
    }

    public setSelected(nodeId: string | null) {
        this.selectedNodeId = nodeId;
    }

    private renderStatic() {
        // 1. Render Intervals (The Curves between strands)
        const intervals = this.layers.intervals.selectAll("path").data(this.steps);
        intervals.exit().remove();
        intervals.enter().append("path")
            .merge(intervals as any)
            .attr("fill", "none")
            .attr("stroke-linecap", "round")
            // SOLID lines for structure, but curved
            .attr("stroke-dasharray", null);

        // 2. Render Synapses (Cross Links - Logic Links)
        const synapseLinks = this.layers.synapses.selectAll("path").data(this.links);
        synapseLinks.exit().remove();
        synapseLinks.enter().append("path")
            .merge(synapseLinks as any)
            .attr("fill", "none")
            .attr("stroke-dasharray", "2 4") // Synapses remain dotted to denote "Virtual Links"
            .attr("stroke-linecap", "round");

        // 3. Render Nodes (Orbs)
        const nodes = this.layers.nodes.selectAll("g").data(this.allNodes, (d: any) => d.id);
        nodes.exit().remove();
        
        const nodesEnter = nodes.enter().append("g")
            .style("cursor", "pointer")
            .on("mouseenter", (e, d) => {
                if (this.isDragging) return;
                this.isPaused = true;
                this.activeNodeId = d.id;
                this.callbacks.onNodeHover(d, e.clientX, e.clientY);
            })
            .on("mouseleave", () => {
                this.isPaused = false;
                this.activeNodeId = null;
                this.callbacks.onNodeHover(null, 0, 0);
            })
            .on("click", (e, d) => {
                e.stopPropagation();
                this.selectedNodeId = (this.selectedNodeId === d.id) ? null : d.id;
                this.callbacks.onNodeClick(d, e.shiftKey);
            });

        // Outer Glow/Halo
        nodesEnter.append("circle").attr("class", "halo");
        // Inner Core
        nodesEnter.append("circle").attr("class", "core");

        const nodesUpdate = nodesEnter.merge(nodes as any);
        
        nodesUpdate.select(".halo")
            .attr("r", 8)
            .attr("fill", (d: any) => {
                // "Dark Point" logic: Old nodes use the Dark Gradient
                const isRecent = this.recentNodeIds.has(d.id);
                if (!isRecent) return "url(#orbGradDark)";
                return d.strand === 'A' ? "url(#orbGradGold)" : "url(#orbGradPurple)";
            })
            .attr("stroke", (d: any) => this.recentNodeIds.has(d.id) ? "#FFFFFF" : "#444")
            .attr("stroke-width", (d: any) => this.recentNodeIds.has(d.id) ? 1 : 0.5);

        nodesUpdate.select(".core")
            .attr("r", (d: any) => this.recentNodeIds.has(d.id) ? 3 : 2)
            .attr("fill", (d: any) => this.recentNodeIds.has(d.id) ? "#FFFFFF" : "#555");

        // 4. Render Strands (DNA Backbone) - SOLID LINES
        this.layers.frontStrands.selectAll("path").remove();
        this.layers.backStrands.selectAll("path").remove();
        
        const createStrandPath = (group: any, id: string, color: string) => {
            return group.append("path")
                .attr("id", id)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 2)
                .attr("stroke-linecap", "round")
                .attr("stroke-dasharray", null); // Ensure SOLID
        };

        createStrandPath(this.layers.frontStrands, "pathAFront", "#FFE580");
        createStrandPath(this.layers.frontStrands, "pathBFront", "#7B2EFF");
        createStrandPath(this.layers.backStrands, "pathABack", "#FFE580");
        createStrandPath(this.layers.backStrands, "pathBBack", "#7B2EFF");
    }

    public start() {
        if (this.timer) this.timer.stop();
        this.timer = d3.timer(this.tick.bind(this));
    }

    public stop() {
        if (this.timer) this.timer.stop();
    }

    private tick() {
        if (!this.isPaused && !this.isDragging) {
            this.rotation += this.velocity;
        }

        const { height: helixHeight, startY } = calculateHelixDimensions(this.height, this.steps.length);
        const stepSpacing = helixHeight / (this.steps.length || 1);

        const getPoint = (idx: number, strand: 'A'|'B') => {
            const y = startY + idx * stepSpacing;
            return calculateHelixPoint(y, strand, this.rotation, this.width, startY, helixHeight);
        }

        // 1. Update Interval Curves (The Connecting "Arcs")
        this.layers.intervals.selectAll("path")
            .attr("d", (d: any) => {
                const pA = getPoint(d.index, 'A');
                const pB = getPoint(d.index, 'B');
                
                // Curve Logic: Calculate a distinct arc
                const midX = (pA.x + pB.x) / 2;
                const midY = (pA.y + pB.y) / 2;
                
                // Calculate distance to determine arc intensity
                const dx = pA.x - pB.x;
                const dy = pA.y - pB.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // SIGNIFICANT CURVE: Use a larger multiplier (0.3) so it looks like a bow/curve, not a rung.
                const curveOffset = dist * 0.3; 
                
                return `M${pA.x},${pA.y} Q${midX},${midY - curveOffset} ${pB.x},${pB.y}`;
            })
            .attr("stroke", (d: any) => {
                const isActive = (d.question && this.recentNodeIds.has(d.question.id)) || 
                                 (d.objective && this.recentNodeIds.has(d.objective.id));
                return isActive ? "#FFE580" : "#333344";
            })
            .attr("stroke-width", (d: any) => {
                 const pA = getPoint(d.index, 'A');
                 const zNorm = (pA.z + 1) / 2;
                 return 0.5 + (1.5 * zNorm);
            })
            .attr("opacity", (d: any) => {
                const pA = getPoint(d.index, 'A');
                const zNorm = (pA.z + 1) / 2;
                // Fade out curves deep in Z space
                return 0.3 + (0.4 * zNorm);
            });

        // 2. Update Nodes (Scale & Opacity)
        this.layers.nodes.selectAll("g")
            .attr("transform", (d: any) => {
                const p = getPoint(d.index, d.strand);
                (d as any)._z = p.z;
                const scale = 0.5 + ((p.z + 1) / 2) * 0.7; 
                return `translate(${p.x},${p.y}) scale(${scale})`;
            })
            .attr("opacity", (d: any) => {
                 const isSelected = this.selectedNodeId === d.id;
                 const isRecent = this.recentNodeIds.has(d.id);
                 if (isSelected || isRecent) return 1.0;

                 // "Dark Points" fade significantly into background
                 const p = getPoint(d.index, d.strand);
                 const zNorm = (p.z + 1) / 2;
                 return 0.2 + (0.5 * zNorm);
            });
        
        this.layers.nodes.selectAll("g").sort((a: any, b: any) => a._z - b._z);

        // 3. Update Synapse Links
        this.layers.synapses.selectAll("path")
            .attr("d", (d: any) => {
                const sourceStep = this.allNodes.find(n => n.id === d.source.id)?.index ?? 0;
                const targetStep = this.allNodes.find(n => n.id === d.target.id)?.index ?? 0;
                
                const ps = getPoint(sourceStep, d.source.strand as any);
                const pt = getPoint(targetStep, d.target.strand as any);
                const midY = (ps.y + pt.y) / 2;
                const midX = (ps.x + pt.x) / 2;
                return `M${ps.x},${ps.y} Q${midX},${midY} ${pt.x},${pt.y}`;
            })
            .attr("stroke", "#FFFFFF")
            .attr("stroke-width", 1)
            .attr("opacity", (d: any) => {
                 const focusId = this.activeNodeId || this.selectedNodeId;
                 if (focusId) {
                     if (d.source.id === focusId || d.target.id === focusId) return 0.6;
                     return 0.05; 
                 }
                 return 0; 
            });

        // 4. Update Strands (Curves)
        const lineGen = d3.line().curve(d3.curveCardinal);
        const pointsA = [], pointsB = [];
        const samples = this.steps.length * 4; 
        
        for(let i=0; i<=samples; i++) {
             const y = startY + (i / samples) * (this.steps.length * stepSpacing);
             const pA = calculateHelixPoint(y, 'A', this.rotation, this.width, startY, helixHeight);
             const pB = calculateHelixPoint(y, 'B', this.rotation, this.width, startY, helixHeight);
             pointsA.push([pA.x, pA.y]);
             pointsB.push([pB.x, pB.y]);
        }
        
        const d_A = lineGen(pointsA as any);
        const d_B = lineGen(pointsB as any);

        if (d_A) {
            this.layers.frontStrands.select("#pathAFront").attr("d", d_A).attr("opacity", 0.9);
            this.layers.backStrands.select("#pathABack").attr("d", d_A).attr("opacity", 0.15);
        }
        if (d_B) {
            this.layers.frontStrands.select("#pathBFront").attr("d", d_B).attr("opacity", 0.9);
            this.layers.backStrands.select("#pathBBack").attr("d", d_B).attr("opacity", 0.15);
        }
    }
}
