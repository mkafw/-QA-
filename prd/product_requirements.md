
# Product Requirements Document (PRD)

**Project Name**: QA-OS (Dual-Core Learning System)
**Version**: 1.3.0
**Status**: Draft

## 1. Product Overview
QA-OS is a biological-inspired personal learning system that treats knowledge acquisition as a dual-helix structure. It rejects traditional folder-based management in favor of a dynamic, graph-based network driven by two core entities: Questions (Cognition) and Objectives (Action).

## 2. Core Philosophy: The Epistemological Engine
The system operates on a **Metabolic Cycle** governed by thermodynamic laws.

*   **Contextualization (Input)**: No "orphan" nodes. Every Knowledge Node must be linked to Action or Cognition.
*   **Falsification (Process)**: Action tests Knowledge.
    *   **Sedimentation**: `Failure + Analysis = New Question`.
    *   **Crystallization**: `Success + Verification = Axiom`. Completed OKRs reinforce linked Knowledge.
*   **Network Emergence (Output)**:
    *   **Pruning**: Unused nodes fade.
    *   **Resonance**: System suggests similar links.
    *   **Mutation (NEW)**: System suggests random, distant links to spark innovation.
    *   **Resistance (NEW)**: System enforces "Cognitive Cost" by blocking orphan node creation.

## 3. User Roles
*   **Agent Architect**: Single user (Personal Knowledge Base).

## 4. Functional Requirements

### 4.1 The Synapse Canvas (QA View)
*   **Description**: A masonry/waterfall layout for managing atomic knowledge units.
*   **Key Interactions**:
    *   **Create Question**: Markdown editor with support for code blocks.
    *   **Orphan Blockade (Resistance)**: The "Save" button is DISABLED unless the user includes at least one Link (`[[...]]`) or Asset (`@...`). Knowledge cannot exist in a vacuum.
    *   **Smart Input**:
        *   Type `[[` to search and link.
        *   Type `@` to upload.
    *   **Filtering**: Filter by Learning Level (L0 Tool, L1 Pattern, L2 Self).

### 4.2 The Helix Strategy (OKR View)
*   **Description**: A hierarchical view of Objectives and Key Results.
*   **Key Interactions**:
    *   **O-KR Tree**: Visual nesting of Objectives and Key Results.
    *   **Linking**: Every KR must link to at least one supporting Question (The "Why" or "How").
    *   **Crystallization Trigger**: Marking an Objective as "Completed" triggers a visual update (Gold Glow) on all linked Questions.

### 4.3 The Neural Graph (Graph View)
*   **Description**: A 3D visualization of the knowledge base.
*   **Visual Metaphor**: DNA Double Helix.
*   **Interaction**:
    *   **Dark Matter (NEW)**: The graph should calculate "Structural Holes" (large distances between dense clusters) and render "Ghost Nodes" suggesting missing links.
    *   **Hover**: Pause rotation, show Holographic Card.
    *   **Visual Decay**: Older/Inactive nodes render smaller and more transparent.

### 4.4 Sedimentation Protocol (Failure Queue)
*   **Description**: A staging area for execution failures.
*   **Workflow**:
    1.  **Ingest**: Log a failure (manual or API).
    2.  **Semantic Check**: System suggests existing Questions that might be relevant.
    3.  **Transmute**: Click "Sediment" to convert the Failure into a verified Question Node.

### 4.5 Neural Version Control
*   **Description**: A meta-management tool for the learning process.
*   **Features**:
    *   **Iteration Logs**: Track "Mental Commits".
    *   **Context Manifest**: Read-only view of current system rules and known issues.
