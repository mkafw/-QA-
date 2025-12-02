
# UI Style Guide & Design System

**Theme Name**: Cosmic Glass (QA-OS Helix)
**Design Philosophy**: "Bionic Sci-Fi meets Apple Glass."
**Visual Keywords**: Volumetric, Holographic, Deep Space, Elegant.

## ⚠️ CRITICAL DIRECTIVES FOR AI GENERATION
1.  **PRESERVE THE GLOW**: The "Cosmic" aesthetic is core. Use deep blurs, inner shadows, and subtle gradients.
2.  **DNA METAPHOR**: Visuals should feel organic and connected (Helix, Synapses), not rigid grids.
3.  **HIGH-END DARK MODE**: This is not just "Dark Mode", it is "Deep Space". Backgrounds are almost black but have depth (Orbs, Gradients).

## 1. Color Palette

### The Cosmic Void (Backgrounds)
*   **Deep Void**: `#050510` (Primary Background).
*   **Glass Surface**: `rgba(255, 255, 255, 0.03)` with `backdrop-blur-xl`.
*   **Glass Border**: `rgba(255, 255, 255, 0.1)`.

### Nebular Accents (Gradients & Glows)
*   **Electric Blue**: `#2E5CFF` (Primary Action / QA Strand).
*   **Nebular Purple**: `#7B2EFF` (OKR Strand / Strategy).
*   **Event Horizon Cyan**: `#00F0FF` (Success / Sedimentation).
*   **Starlight Gold**: `#FFE580` (Highlights / Tooltips).
*   **Red Giant**: `#FF2E5B` (Failure / Alerts).

## 2. Typography
*   **Headings**: `Cinzel` (Serif) - Used for major titles to convey "Nobility/Timelessness".
*   **UI Text**: `Inter` (Sans-serif) - Clean, readable, neutral.
*   **Data/Code**: `JetBrains Mono` - Tech precision.

## 3. Components

### 3.1 The "Apple Glass" Card
*   **Material**: High transparency (`bg-white/5`), High Blur (`backdrop-blur-md`).
*   **Lighting**:
    *   **Gloss Sheen**: Top 50% linear white gradient (`opacity-5`).
    *   **Inner Glow**: `box-shadow: inset 0 0 20px rgba(255,255,255,0.05)`.
*   **Shape**: `rounded-3xl` (Large continuous curves).

### 3.2 Navigation (The Helix Strand)
*   **Structure**: Floating vertical spine.
*   **Nodes**: "Glass Beads" - Spherical look using radial gradients and inner shadows.
*   **Active State**: Glowing orb behind the bead.

### 3.3 The 3D Graph (Helix)
*   **Render Mode**: "Nebula".
*   **Strands**: Wide, blurred strokes (`filter: blur(8px)`) overlaid with thin, bright cores.
*   **Particles**: Glowing orbs.

## 4. Animation / Motion
*   **Physics**: Smooth, floating (Sine waves).
*   **Interaction**: Elements should "lift" (Scale 1.05 + Shadow) on hover.
*   **Scroll**: Custom thin scrollbars that blend into the glass.
