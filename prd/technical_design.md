
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
5.  **Logic Layer (`/utils`)**:
    *   **Responsibility**: Pure functions, Math, Algorithms. No side effects.
    *   **Example**: `helixMath.ts`.

## 2. Directory Structure
```
/
├── components/       # View (Dumb Components)
│   ├── Layout.tsx
│   ├── GraphView.tsx
│   └── ...
├── hooks/            # Access (Controllers)
│   └── useQASystem.ts
├── services/         # Domain (Business Logic)
│   └── SedimentationService.ts
├── repositories/     # Data (Storage Access)
│   └── MemoryRepository.ts
│   └── SupabaseRepository.ts
├── utils/            # Logic (Pure Math)
│   └── helixMath.ts
├── types.ts          # Shared Type Definitions
└── prd/              # Documentation Source of Truth
```

## 3. Technology Stack

### Frontend (Client)
*   **Framework**: Next.js 14+ (App Router) / React 18.
*   **Styling**: Tailwind CSS (Cosmic Glass Theme).
*   **Visualization**: D3.js (Managed via `helixMath` utility).

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

### Storage Interfaces
*   `IRepository`: Standard CRUD for application entities.
*   `IVectorStore`: Semantic search interface (SeekDB).

## 5. Key Algorithms

### 3D Helix Projection (`helixMath.ts`)
*   **Input**: `yBase` (Linear position), `strand` (A/B), `rotation`.
*   **Output**: `{x, y, z}`.
*   **Physics**:
    *   `x = sin(angle) * amp`
    *   `z = cos(angle)`
    *   `y = yBase + (z * TILT_FACTOR)` -> Creates the 3D slated rung effect.
