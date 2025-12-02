
# Project Neural Manifest

## 1. Organization Architecture
The codebase follows a strict **Separation of Concerns** (DDD-lite):

- **`/components` (View Layer)**: Dumb UI components. No complex logic.
- **`/hooks` (Access Layer)**: React Hooks that act as Controllers. Connects View to Service.
- **`/services` (Domain Layer)**: Pure business logic (e.g., Sedimentation rules).
- **`/repositories` (Data Layer)**: CRUD operations. Hides data source implementation.
- **`/utils` (Logic Layer)**: Pure math/algorithms (e.g., Helix calculations).

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
- **Status**: Ready for Production Data.
