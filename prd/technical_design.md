
# Technical Design Document (TDD)

**Project Code**: Helix-01
**Architecture**: Layered Architecture (DDD-Lite) on Client-Side

## 1. Architectural Patterns
We have moved away from a monolithic Component structure to a **Separation of Concerns** model.

### 1.1 The 5-Layer Model
1.  **View Layer (`/components`)**:
    *   **Responsibility**: Rendering UI, capturing user events.
    *   **Constraint**: Must not contain business logic or math calculations.
    *   **State**: Local UI state only (e.g., `isHovered`).
2.  **Access Layer (`/hooks`)**:
    *   **Responsibility**: The "Controller". Wires UI to Services/Repositories. Manages React State (`useState`, `useEffect`).
    *   **Example**: `useQASystem`.
3.  **Domain Layer (`/services`)**:
    *   **Responsibility**: Business Rules, Transactions, Workflows.
    *   **Example**: `SedimentationService` (Transmuting Failure -> Question).
4.  **Data Layer (`/repositories`)**:
    *   **Responsibility**: Data persistence, CRUD, Mocking. Hides whether data comes from Memory, LocalStorage, or API.
    *   **Example**: `MemoryRepository`.
5.  **Logic Layer (`/logic` & `/utils`)**:
    *   **Responsibility**: Visualization Engine, Pure Math, Algorithms.
    *   **Example**: `GraphRenderer` and its Systems.

## 2. Directory Structure
```
/
├── components/       # View (Dumb Components)
├── hooks/            # Access (Controllers)
├── services/         # Domain (Business Logic)
├── repositories/     # Data (Storage Access)
├── utils/            # Pure Math (helixMath.ts)
├── logic/            # Render Engine
│   ├── GraphRenderer.ts  # Orchestrator
│   └── systems/
│       ├── SceneSystem.ts      # Layers & Definitions
│       ├── StructureSystem.ts  # Strands & Links
│       └── NodeSystem.ts       # Interactive Nodes
├── types.ts          # Shared Type Definitions
└── prd/              # Documentation Source of Truth
```

## 3. Technology Stack

### Frontend (Client)
*   **Framework**: Next.js 14+ (App Router) / React 18.
*   **Styling**: Tailwind CSS (Cosmic Glass Theme).
*   **Visualization**: D3.js (Managed via System Architecture).

### Backend & Storage (Phase 2)
*   **Relational Data**: Supabase (PostgreSQL) - storing Questions, OKRs, Failures.
*   **Vector Engine**: **OceanBase SeekDB** - High-concurrency vector retrieval for "Smart Input" and Semantic Search.
*   **Server**: Rust (Axum) - Future migration target for API layer.

## 4. Data Models (Types)

### Core Entities
*   **NodeBase**: `id`, `createdAt`, `updatedAt`
*   **Question**: Extends NodeBase. `content` (Markdown), `level` (0-2).
*   **Objective**: Extends NodeBase. `keyResults[]`.
*   **Failure**: Extends NodeBase. `analysis5W2H`, `convertedToQuestionId`.

## 5. Key Algorithms

### 3D Helix Projection (`helixMath.ts`)
*   **Input**: `yBase` (Linear position), `strand` (A/B), `rotation`.
*   **Output**: `{x, y, z}`.
*   **Physics**:
    *   `x = sin(angle) * amp`
    *   `z = cos(angle)`
    *   `y = yBase + (z * TILT_FACTOR)` -> Creates the 3D slated rung effect.

## 6. Rendering Engine Architecture
The visualization logic is split into a **System-based** architecture managed by an Orchestrator.

1.  **Orchestrator (`GraphRenderer`)**:
    *   Manages the Physics Loop (`d3.timer`).
    *   Maintains Physics State (Rotation, Velocity, Paused/Dragging).
    *   Delegates rendering to subsystems.
2.  **SceneSystem**:
    *   Owns the DOM (`<svg>`, `<defs>`).
    *   Manages Layer stacking (Painter's Algorithm) to ensure correct depth sorting.
    *   Defines global filters (Glow) and Gradients.
3.  **StructureSystem**:
    *   Stateless renderer for the "Macro" structure.
    *   Draws DNA Strands (Backbone), Curved Intervals (Rungs), and Synapses (Links).
4.  **NodeSystem**:
    *   Stateful renderer for the "Micro" entities (Nodes).
    *   Manages visual state (Active/Selected/Dark/Light).
    *   **Interaction**: Handles specific Hit Areas for mouse events (Hover/Click) and bubbles them up to the Orchestrator.
