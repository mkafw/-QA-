
import * as d3 from 'd3';
import { GraphNode, HelixStep } from '../types';
import { calculateHelixPoint, calculateHelixDimensions } from '../utils/helixMath';
import { SceneSystem } from './systems/SceneSystem';
import { NodeSystem } from './systems/NodeSystem';
import { StructureSystem } from './systems/StructureSystem';

interface RendererOptions {
    container: HTMLDivElement;
    svgElement: SVGSVGElement;
    onNodeHover: (node: GraphNode | null, x: number, y: number) => void;
    onNodeClick: (node: GraphNode, isShiftKey: boolean) => void;
    onBackgroundClick: () => void;
}

export class GraphRenderer {
    // Systems
    private scene: SceneSystem;
    private nodeSystem: NodeSystem;
    private structureSystem: StructureSystem;

    // Physics State
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

    private callbacks: RendererOptions;

    constructor(options: RendererOptions) {
        this.callbacks = options;
        
        // 1. Initialize Subsystems
        this.scene = new SceneSystem(options.svgElement);
        
        this.nodeSystem = new NodeSystem(this.scene.layers, {
            onHover: (e, d) => this.handleNodeHover(e, d),
            onLeave: (e, d) => this.handleNodeLeave(),
            onClick: (e, d) => this.handleNodeClick(e, d)
        });

        this.structureSystem = new StructureSystem(this.scene.layers);

        // 2. Initialize Interaction
        this.initializeGlobalInteraction(options.container);
    }

    // --- Interaction Handlers ---

    private initializeGlobalInteraction(container: HTMLDivElement) {
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
                this.velocity = 0.005; 
            })
            .on("mouseleave", () => {
                this.isDragging = false;
                this.velocity = 0.005;
            })
            .on("click", (e) => {
                // Check if background was clicked (D3 target is the container)
                if (e.target === container) {
                    this.selectedNodeId = null;
                    this.callbacks.onBackgroundClick();
                }
            });
    }

    private handleNodeHover(event: any, node: GraphNode) {
        if (this.isDragging) return;
        this.isPaused = true;
        this.activeNodeId = node.id;
        this.callbacks.onNodeHover(node, event.clientX, event.clientY);
    }

    private handleNodeLeave() {
        this.isPaused = false;
        this.activeNodeId = null;
        this.callbacks.onNodeHover(null, 0, 0);
    }

    private handleNodeClick(event: any, node: GraphNode) {
        event.stopPropagation();
        this.selectedNodeId = (this.selectedNodeId === node.id) ? null : node.id;
        this.callbacks.onNodeClick(node, event.shiftKey);
    }

    // --- Public API ---

    public updateDimensions(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public updateData(steps: HelixStep[], allNodes: GraphNode[], links: any[], recentIds: Set<string>) {
        this.steps = steps;
        this.allNodes = allNodes;
        this.links = links;
        this.recentNodeIds = recentIds;
        // Trigger a render immediately to show new data static frame
        this.tick(); 
    }

    public setSelected(nodeId: string | null) {
        this.selectedNodeId = nodeId;
    }

    public start() {
        if (this.timer) this.timer.stop();
        this.timer = d3.timer(this.tick.bind(this));
    }

    public stop() {
        if (this.timer) this.timer.stop();
    }

    // --- Main Loop ---

    private tick() {
        // Physics Step
        if (!this.isPaused && !this.isDragging) {
            this.rotation += this.velocity;
        }

        // Layout Calculation Helpers
        const { height: helixHeight, startY } = calculateHelixDimensions(this.height, this.steps.length);
        const stepSpacing = helixHeight / (this.steps.length || 1);

        // Closure to pass to drawers (Projection Matrix)
        const getPoint = (idx: number, strand: 'A'|'B') => {
            const y = startY + idx * stepSpacing;
            return calculateHelixPoint(y, strand, this.rotation, this.width, startY, helixHeight);
        };

        // Render Step (Delegation)
        
        // 1. Draw Structure (Strands, Rungs, Synapses)
        this.structureSystem.render(
            this.steps, 
            this.links, 
            this.allNodes, 
            this.recentNodeIds, 
            this.activeNodeId, 
            this.selectedNodeId,
            getPoint,
            { startY, stepSpacing, width: this.width, height: helixHeight, rotation: this.rotation }
        );

        // 2. Draw Nodes
        this.nodeSystem.render(
            this.allNodes, 
            this.recentNodeIds, 
            this.activeNodeId, 
            this.selectedNodeId,
            getPoint
        );
    }
}
