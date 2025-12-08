
# Project Neural Manifest

## 1. Organization Architecture
The codebase follows a strict **Separation of Concerns** (DDD-lite):

- **`/components` (View Layer)**: Dumb UI components. No complex logic.
- **`/hooks` (Access Layer)**: React Hooks that act as Controllers. Connects View to Service.
- **`/services` (Domain Layer)**: Pure business logic (e.g., Sedimentation rules).
- **`/repositories` (Data Layer)**: CRUD operations. Hides data source implementation.
- **`/utils` (Logic Layer)**: Pure math/algorithms (e.g., Helix calculations).
- **`/logic` (Render Engine)**: D3.js visualization logic, organized by Systems.

## 2. Iteration Protocol
1. **Plan**: Update `.ai-context.md` with intent.
2. **Refactor**: Create/Update Logic/Service layers first.
3. **Wire**: Update Hooks.
4. **Render**: Update UI components.
5. **Log**: Record iteration in `PROJECT_MANIFEST.md`.
6. **Sync**: Update `prd/*.md` files to match the new code reality.

## 3. Evolution Chronicles

### Iteration 1-3: Genesis
- Basic setup, Visuals, and Mock Data.

### Iteration 4: 3D Physics
- Implemented TILT factor for 3D depth perception.

### Iteration 5: Architectural Refactoring
- **Hash**: `arch-refactor-v1`
- **Summary**: Decoupled the "God Component" App.tsx into a Layered Architecture.

### Iteration 6: Data Persistence Integration
- **Hash**: `data-persist-v1`
- **Summary**: Implemented the `IRepository` interface and `SupabaseRepository`.
- **Key Change**: `useQASystem` now acts as a Repository Factory, auto-switching between Memory (Mock) and Supabase (Real) based on environment configuration.

### Iteration 7: SeekDB Architecture Strategy
- **Hash**: `seekdb-arch-v1`
- **Summary**: Defined `IVectorStore` interface for OceanBase SeekDB integration. Added SQL Schema for Supabase tables.

### Iteration 8: Interactive Helix & CRUD
- **Hash**: `helix-interact-v1`
- **Summary**: Enabled Click-to-Select and Shift+Click-to-Delete in 3D Graph. Restored visual Links and Tooltips.
- **Changes**: Updated `GraphView` D3 logic, extended `IRepository` with delete methods, wired `App.tsx` handlers.

### Iteration 9: System-Based Rendering Architecture
- **Hash**: `sys-arch-v1`
- **Summary**: Refactored the monolithic `GraphRenderer` into a modular System-based architecture to improve maintainability and interaction handling.
- **Key Changes**:
  - Created `logic/systems/` directory.
  - **SceneSystem**: Manages SVG layers, definitions, gradients, and filters.
  - **StructureSystem**: Draws the Helix backbone, curved rungs, and synapses.
  - **NodeSystem**: Manages node visuals, physics projection, and interaction events (Hit Areas).
  - **GraphRenderer**: Now acts as a lightweight Orchestrator/Physics Engine.
