# QA-OS: Dual-Core Learning System 🧬

> **"Knowledge is not a folder structure; it is a living organism."**

QA-OS is a biological-inspired personal learning system that treats knowledge acquisition as a dynamic, graph-based network. It rejects traditional hierarchies in favor of a **Dual-Core Driver** powered by **Cognition (Questions)** and **Action (Objectives)**.

---

## 🌌 Core Philosophy: The Epistemological Engine

Most systems treat knowledge management as a **Librarian's Task** (Categorization). QA-OS treats it as an **Architect's Task** (Construction & Verification).

### The QA-OS Metabolic Cycle (Ingest -> Metabolize -> Synthesize)
We use a biological loop to ensure knowledge evolves:

1.  **Contextualization (The Soil)**: Information acts as "Nutrients" anchored to a specific context (Question).
2.  **Falsification (The Filter)**: **Strand B (OKR)** acts as the testing ground. Failed actions trigger **Sedimentation**, converting Failures into new Questions.
3.  **Emergence (The Output)**: Knowledge clusters form through usage, not arbitrary filing.

---

## ⚖️ The Laws of Knowledge Thermodynamics

To prevent the system from becoming a static archive or a chaotic mess, five logic laws enforce ecosystem health:

### 1. The Law of Crystallization (Handling Success)
*   **Logic**: If Failure creates Questions, **Success must create Axioms.**
*   **Effect**: Completed OKRs reinforce linked Knowledge Nodes (Gold Glow), locking them against decay.

### 2. The Law of Synaptic Pruning (Handling Entropy)
*   **Logic**: A graph that only grows eventually becomes cancer.
*   **Effect**: Unused, unlinked nodes fade over time (Apoptosis), clearing visual noise.

### 3. The Law of Semantic Resonance (Handling Subconscious)
*   **Logic**: Connections shouldn't always be manual.
*   **Effect**: The system runs a background "Dream Process" (Vector Search) to suggest links between similar nodes.

### 4. The Law of Mutation (Handling Innovation) - *NEW*
*   **Logic**: Efficiency kills innovation. We need **Chaos**.
*   **Effect**: The system occasionally injects **Random High-Distance Links**. It forces you to ask: "How does [Farming] relate to [Compiler Design]?" This creates "Saltations" (Evolutionary Leaps).

### 5. The Law of Metabolic Cost (Handling Obesity) - *NEW*
*   **Logic**: Information is cheap; Structure is expensive.
*   **Effect**: **Creation Resistance**. The system forbids "Orphan Nodes". You cannot create a Question unless you pay the "Cognitive Cost" of linking it to an existing Objective or Problem immediately.

---

## 🧩 Functional Matrix

The system is divided into four distinct functional modules:

### 1. 🧬 Neural Helix (The Hub)
*   **Role**: Visualization & Navigation.
*   **Features**:
    *   **3D DNA Projection**: Mathematically accurate double helix rendering.
    *   **Dark Matter Visualization**: Highlights **Structural Holes** (gaps between clusters) to suggest missing knowledge.
    *   **Holographic Interaction**: Hover to view metadata, Shift+Click to prune nodes.

### 2. 🧠 Synapse Canvas (Cognition)
*   **Role**: Knowledge Management (QA).
*   **Features**:
    *   **L0-L2 Filtering**: Filter by Tool, Pattern, or Self knowledge levels.
    *   **Cost Enforcer**: UI disables the "Save" button until a link `[[...]]` is added.

### 3. 🎯 Strategy Core (Action)
*   **Role**: Goal Management (OKR).
*   **Features**:
    *   **Dependency Tracking**: Visualizes how many "Nodes" support a specific Objective.
    *   **Status Lights**: Real-time tracking of Key Result progress.

### 4. ☢️ Sedimentation Protocol (Reflection)
*   **Role**: Failure Processing.
*   **Philosophy**: "Failures are just data points waiting to be refined."
*   **Workflow**: 
    1.  **Ingest** failure.
    2.  **Analyze** (5W2H).
    3.  **Transmute** failure into a new Question node (closing the loop).

---

## 🏗 Technical Architecture

This project follows a **DDD-Lite (Domain-Driven Design)** approach to separate concerns strictly.

### The 5-Layer Model
1.  **View Layer** (`/components`): Pure UI rendering. No business logic.
2.  **Access Layer** (`/hooks`): Controllers that wire UI to Data (`useQASystem`).
3.  **Domain Layer** (`/services`): Business rules (e.g., `SedimentationService`).
4.  **Data Layer** (`/repositories`): Data persistence interface (`IRepository`).
5.  **Engine Layer** (`/logic`): The Visualization Orchestrator (Scene, Node, Structure Systems).

### Rendering Engine (`logic/`)
The 3D Visualization uses a **System-Based Architecture**:
- **GraphRenderer**: The Orchestrator managing the physics loop.
- **SceneSystem**: Manages SVG layers (Z-index stacking) and filters (Glow).
- **StructureSystem**: Draws the macro DNA strands and connections.
- **NodeSystem**: Draws micro nodes and handles pointer events.

---

## 💾 Data Loading Strategy

The system uses a **Repository Factory Pattern** to support seamless environment switching:

1.  **Initialization**:
    *   `useQASystem` hook checks for `NEXT_PUBLIC_SUPABASE_URL`.
2.  **Factory Logic**:
    *   **Production**: If API Keys exist, initializes `SupabaseRepository`.
    *   **Prototype**: If no keys, initializes `MemoryRepository` (using `mockData.ts`).
3.  **Vector Store** (Future):
    *   Architecture is ready for **OceanBase SeekDB** for semantic search.

---

## 🧬 Evolution Protocol

We use a **"Neural Commit"** workflow to track project evolution.

1.  **Plan**: Update `.ai-context.md` with the current focus.
2.  **Refactor**: Update Logic/Services first.
3.  **Wire**: Update Hooks.
4.  **Render**: Update Components.
5.  **Manifest**: Log the iteration hash in `PROJECT_MANIFEST.md`.

---

## ⚡ Quick Start

1.  **Install**:
    ```bash
    npm install
    ```

2.  **Run (Memory Mode)**:
    *   Just run `npm start`. The system detects missing keys and loads Mock Data automatically.

3.  **Run (Production Mode)**:
    *   Create `.env.local` with Supabase credentials.
    *   Run `npm start`.

---

## 📂 Project Structure

```
/
├── components/       # View Layer
├── hooks/            # Access Layer (Controllers)
├── services/         # Domain Layer (Business Logic)
├── repositories/     # Data Layer (Interfaces & Impls)
├── logic/            # Render Engine (Systems)
│   ├── systems/      # Scene, Structure, Node
│   └── GraphRenderer # Physics Orchestrator
├── utils/            # Math Helpers
└── prd/              # Documentation Source of Truth
```

**License**: MIT
