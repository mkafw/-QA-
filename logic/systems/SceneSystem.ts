
import * as d3 from 'd3';

// Helper type for cleaner D3 selections
type SVGSelection = d3.Selection<SVGGElement, unknown, null, undefined>;
type DefsSelection = d3.Selection<SVGDefsElement, unknown, null, undefined>;

export interface SceneLayers {
    defs: DefsSelection;
    backStrands: SVGSelection;
    intervals: SVGSelection;
    synapses: SVGSelection;
    nodes: SVGSelection;
    frontStrands: SVGSelection;
    pulseStrands: SVGSelection; // NEW: Layer for the moving highlights
}

export class SceneSystem {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    public layers: SceneLayers;

    constructor(svgElement: SVGSVGElement) {
        this.svg = d3.select(svgElement);
        this.svg.selectAll("*").remove(); // Clear previous rendering context
        
        // 0. Inject Styles for Animation
        // We do this via JS to avoid touching global CSS files
        this.svg.append("style").text(`
            @keyframes strandFlow {
                to { stroke-dashoffset: -40; }
            }
            .helix-pulse {
                stroke-dasharray: 8 32; /* 8px dash, 32px gap */
                animation: strandFlow 1s linear infinite; /* Fast flow */
                mix-blend-mode: screen;
            }
        `);

        // 1. Definitions Container (Filters, Gradients)
        const defs = this.svg.append("defs");
        
        // 2. Main Scene Container (Group)
        const mainGroup = this.svg.append("g").attr("class", "helix-scene");

        // 3. Initialize Layer Order (Painter's Algorithm: Back -> Front)
        this.layers = {
            defs: defs,
            // Layer 0: Back Strands (Farthest)
            backStrands: mainGroup.append("g").attr("class", "layer-back-strands"),
            // Layer 1: Rungs/Intervals
            intervals: mainGroup.append("g").attr("class", "layer-intervals"),
            // Layer 2: Synaptic Links (Dashed lines)
            synapses: mainGroup.append("g").attr("class", "layer-synapses"),
            // Layer 3: Nodes (The Data Atoms)
            nodes: mainGroup.append("g").attr("class", "layer-nodes"),
            // Layer 4: Front Strands (Closest) - The colored tube
            frontStrands: mainGroup.append("g").attr("class", "layer-front-strands"),
            // Layer 5: Pulse Strands (Highlights) - The moving white energy
            pulseStrands: mainGroup.append("g").attr("class", "layer-pulse-strands"),
        };

        this.initializeFilters(defs);
        this.initializeGradients(defs);
    }

    private initializeFilters(defs: DefsSelection) {
        // STRONG Neon Glow Filter
        const filter = defs.append("filter")
            .attr("id", "glow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");

        // 1. Blur the source
        filter.append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", "4") 
            .attr("result", "blur");

        // 2. Boost Saturation/Brightness of the blur
        filter.append("feColorMatrix")
            .attr("in", "blur")
            .attr("type", "matrix")
            .attr("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7") 
            .attr("result", "goo");

        // 3. Layer Original on top of blurred glow
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "blur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    private initializeGradients(defs: DefsSelection) {
        // Active Node Gradients (Inner Light)
        const createRadial = (id: string, startColor: string, midColor: string, endColor: string) => {
            const grad = defs.append("radialGradient")
                .attr("id", id)
                .attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
            
            grad.append("stop").attr("offset", "0%").attr("stop-color", "#FFFFFF");
            grad.append("stop").attr("offset", "40%").attr("stop-color", startColor);
            grad.append("stop").attr("offset", "70%").attr("stop-color", midColor);
            grad.append("stop").attr("offset", "100%").attr("stop-color", endColor);
        };

        createRadial("orbGradGold", "#FFE580", "rgba(255, 229, 128, 0.5)", "rgba(255, 229, 128, 0)");   
        createRadial("orbGradPurple", "#D8B4FE", "rgba(123, 46, 255, 0.5)", "rgba(123, 46, 255, 0)");

        // Inactive/Standard Node Gradient (Dark Glass)
        const gradDark = defs.append("radialGradient")
            .attr("id", "orbGradDark")
            .attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
        gradDark.append("stop").attr("offset", "0%").attr("stop-color", "#889"); 
        gradDark.append("stop").attr("offset", "50%").attr("stop-color", "#223");
        gradDark.append("stop").attr("offset", "100%").attr("stop-color", "rgba(0,0,0,0)");
    }
}
