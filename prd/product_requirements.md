
# Product Requirements Document (PRD)

**Project Name**: QA-OS (Dual-Core Learning System)
**Version**: 1.0.0
**Status**: Draft

## 1. Product Overview
QA-OS is a biological-inspired personal learning system that treats knowledge acquisition as a dual-helix structure. It rejects traditional folder-based management in favor of a dynamic, graph-based network driven by two core entities: Questions (Cognition) and Objectives (Action).

## 2. Core Philosophy
*   **Dual-Core Driver**: QA and OKR are equivalent and complementary.
    *   **QA-First**: Question -> Answer -> Knowledge Network -> Goal Setting.
    *   **OKR-First**: Objective -> Key Result -> Execution -> Failure -> New Question.
*   **Sedimentation**: Failures are not discarded but analyzed and "sedimented" into the knowledge base as new Questions.

## 3. User Roles
*   **Agent Architect**: Single user (Personal Knowledge Base).

## 4. Functional Requirements

### 4.1 The Synapse Canvas (QA View)
*   **Description**: A masonry/waterfall layout for managing atomic knowledge units.
*   **Key Interactions**:
    *   **Create Question**: Markdown editor with support for code blocks.
    *   **Smart Input**:
        *   Type `[[` to search and link existing Questions or KRs.
        *   Type `@` to upload or link assets (images, logs).
    *   **Filtering**: Filter by Learning Level (L0 Tool, L1 Pattern, L2 Self).

### 4.2 The Helix Strategy (OKR View)
*   **Description**: A hierarchical view of Objectives and Key Results.
*   **Key Interactions**:
    *   **O-KR Tree**: Visual nesting of Objectives and Key Results.
    *   **Linking**: Every KR must link to at least one supporting Question (The "Why" or "How").
    *   **Progress**: Manual status updates (Pending -> In Progress -> Completed).

### 4.3 The Neural Graph (Graph View)
*   **Description**: A 3D visualization of the knowledge base.
*   **Visual Metaphor**: DNA Double Helix.
    *   Strand A: Questions.
    *   Strand B: Objectives/KRs.
    *   Rungs: Links between them.
*   **Interaction**:
    *   **Hover**: Pause rotation, show Holographic Card.
    *   **Card Content**: Show Title, Summary, Assets (@Images), and Tags.

### 4.4 Sedimentation Protocol (Failure Queue)
*   **Description**: A staging area for execution failures.
*   **Workflow**:
    1.  **Ingest**: Log a failure (manual or API).
    2.  **Analyze**: Fill out 5W2H / Root Cause Analysis.
    3.  **Transmute**: Click "Sediment" to convert the Failure into a verified Question Node.

### 4.5 Neural Version Control
*   **Description**: A meta-management tool for the learning process.
*   **Features**:
    *   **Iteration Logs**: Track "Mental Commits".
    *   **Context Manifest**: Read-only view of current system rules and known issues.
