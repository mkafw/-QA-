
import * as d3 from 'd3';

export interface SceneLayers {
    defs: d3.Selection<SVGDefsElement, unknown, null, undefined>;
    backStrands: d3.Selection<SVGGElement, unknown, null, undefined>;
    intervals: d3.Selection<SVGGElement, unknown, null, undefined>;
    synapses: d3.Selection<SVGGElement, unknown, null, undefined>;
    nodes: d3.Selection<SVGGElement, unknown, null, undefined>;
    frontStrands: d3.Selection<SVGGElement, unknown, null, undefined>;
}

export class SceneSystem {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    public layers: SceneLayers;

    constructor(svgElement: SVGSVGElement) {
        this.svg = d3.select(svgElement);
        this.svg.selectAll("*").remove(); // Clear previous
        
        const defs = this.svg.append("defs");
        const mainGroup = this.svg.append("g");

        // Initialize Layer Order (Painter's Algorithm)
        this.layers = {
            defs: defs,
            backStrands: mainGroup.append("g").attr("class", "back-strands"),
            intervals: mainGroup.append("g").attr("class", "intervals"),
            synapses: mainGroup.append("g").attr("class", "synapses"),
            nodes: mainGroup.append("g").attr("class", "nodes"),
            frontStrands: mainGroup.append("g").attr("class", "front-strands"),
        };

        this.initializeFilters(defs);
        this.initializeGradients(defs);
    }

    private initializeFilters(defs: d3.Selection<SVGDefsElement, unknown, null, undefined>) {
        // Glow Filter
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    private initializeGradients(defs: d3.Selection<SVGDefsElement, unknown, null, undefined>) {
        // Bright Orbs (Active)
        const createRadial = (id: string, startColor: string, endColor: string) => {
            const grad = defs.append("radialGradient")
                .attr("id", id)
                .attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
            grad.append("stop").attr("offset", "0%").attr("stop-color", "#FFF");
            grad.append("stop").attr("offset", "40%").attr("stop-color", startColor);
            grad.append("stop").attr("offset", "100%").attr("stop-color", endColor);
        };

        createRadial("orbGradGold", "#FFE580", "rgba(255, 229, 128, 0)");
        createRadial("orbGradPurple", "#D8B4FE", "rgba(123, 46, 255, 0)");

        // Dark Orbs (Inactive/Old)
        const gradDark = defs.append("radialGradient").attr("id", "orbGradDark").attr("cx", "50%").attr("cy", "50%").attr("r", "50%");
        gradDark.append("stop").attr("offset", "0%").attr("stop-color", "#555");
        gradDark.append("stop").attr("offset", "60%").attr("stop-color", "#222");
        gradDark.append("stop").attr("offset", "100%").attr("stop-color", "rgba(0,0,0,0)");
    }
}
