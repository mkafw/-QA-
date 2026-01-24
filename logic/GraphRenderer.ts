
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
    
    // FLUID DYNAMICS
    private baseVelocity: number = 0.0015; // Constant background flow
    private momentum: number = 0; // Inertia from interaction
    private friction: number = 0.94; // Water resistance (Decay rate)
    
    private isDragging: boolean = false;
    private isPaused: boolean = false;
    private timer: d3.Timer | null = null;
    private time: number = 0; 
    
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
        
        this.scene = new SceneSystem(options.svgElement);
        this.nodeSystem = new NodeSystem(this.scene.layers, {
            onHover: (e, d) => this.handleNodeHover(e, d),
            onLeave: (e, d) => this.handleNodeLeave(),
            onClick: (e, d) => this.handleNodeClick(e, d)
        });
        this.structureSystem = new StructureSystem(this.scene.layers);

        this.initializeGlobalInteraction(options.container);
    }

    private initializeGlobalInteraction(container: HTMLDivElement) {
        let lastX = 0;
        let lastTime = 0;

        d3.select(container)
            .on("mousedown", (e) => {
                this.isDragging = true;
                lastX = e.clientX;
                lastTime = Date.now();
                this.momentum = 0; // Stop existing momentum on grab
                container.style.cursor = "grabbing";
            })
            .on("mousemove", (e) => {
                if (!this.isDragging) return;
                const now = Date.now();
                const deltaX = e.clientX - lastX;
                const deltaTime = now - lastTime;
                
                // Direct rotation tracking
                this.rotation += deltaX * 0.005;
                
                // Calculate instant velocity for "Throw" mechanic
                // If moving fast, set high momentum
                if (deltaTime > 0) {
                   const instantVelocity = (deltaX / deltaTime) * 0.5; // Scale factor
                   // Smoothly blend into momentum
                   this.momentum = this.momentum * 0.5 + instantVelocity * 0.5;
                }

                lastX = e.clientX;
                lastTime = now;
            })
            .on("mouseup", () => {
                this.isDragging = false;
                container.style.cursor = "grab";
                // Momentum is preserved from the last mousemove, creating the "throw" effect
            })
            .on("mouseleave", () => {
                this.isDragging = false;
            })
            .on("wheel", (e) => {
                // FLUID SCROLLING
                e.preventDefault();
                
                // Map vertical scroll to horizontal rotation (Helix Twist)
                const scrollStrength = e.deltaY;
                
                // Accumulate momentum (Water Wheel effect)
                // -0.0005 makes 'scroll down' twist in a natural direction
                this.momentum += scrollStrength * 0.0003;

                // Cap max speed to prevent dizziness
                const maxSpeed = 0.08;
                if (this.momentum > maxSpeed) this.momentum = maxSpeed;
                if (this.momentum < -maxSpeed) this.momentum = -maxSpeed;
            })
            .on("click", (e) => {
                if (e.target === container) {
                    this.selectedNodeId = null;
                    this.callbacks.onBackgroundClick();
                }
            });
    }

    private handleNodeHover(event: any, node: GraphNode) {
        if (this.isDragging) return;
        this.isPaused = true; // Pause physics on hover for readability
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

    public updateDimensions(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public updateData(steps: HelixStep[], allNodes: GraphNode[], links: any[], recentIds: Set<string>) {
        this.steps = steps;
        this.allNodes = allNodes;
        this.links = links;
        this.recentNodeIds = recentIds;
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

    private tick() {
        this.time += 0.01;

        if (!this.isDragging && !this.isPaused) {
            // Apply Momentum (Decays over time due to friction)
            this.rotation += this.momentum;
            this.momentum *= this.friction;

            // Apply Base Flow (Eternal Drift)
            // It flows in the direction of the last momentum, or defaults positive
            const flowDir = this.momentum !== 0 ? Math.sign(this.momentum) : 1;
            // Smoothly return to base velocity if momentum is dead
            if (Math.abs(this.momentum) < 0.0001) {
                this.rotation += this.baseVelocity;
            }

            // Idle Breathing (Vertical Float)
            // Only purely visual, doesn't affect rotation logic
        }

        const { height: helixHeight, startY: baseXY } = calculateHelixDimensions(this.height, this.steps.length);
        const stepSpacing = helixHeight / (this.steps.length || 1);

        // Water-like bobbing
        const floatingY = baseXY + (Math.sin(this.time * 0.5) * 12); 

        const getPoint = (idx: number, strand: 'A'|'B') => {
            const y = floatingY + idx * stepSpacing;
            return calculateHelixPoint(y, strand, this.rotation, this.width, floatingY, helixHeight);
        };

        this.structureSystem.render(
            this.steps, 
            this.links, 
            this.allNodes, 
            this.recentNodeIds, 
            this.activeNodeId, 
            this.selectedNodeId,
            getPoint,
            { startY: floatingY, stepSpacing, width: this.width, height: helixHeight, rotation: this.rotation }
        );

        this.nodeSystem.render(
            this.allNodes, 
            this.recentNodeIds, 
            this.activeNodeId, 
            this.selectedNodeId,
            getPoint
        );
    }
}
