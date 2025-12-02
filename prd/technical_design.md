
# Technical Design Document (TDD)

**Project Code**: Helix-01
**Architecture**: Client-Server (Headless UI + Rust Backend)

## 1. Technology Stack

### Frontend (Client)
*   **Framework**: Next.js 14+ (App Router).
*   **Styling**: Tailwind CSS (Utility-first).
*   **State Management**: React Context / Zustand.
*   **Visualization**: D3.js (Direct DOM manipulation for performance) integrated via React Refs.
*   **Icons**: Lucide React.

### Backend (Server) - *Planned*
*   **Runtime**: Rust.
*   **Framework**: Axum or Actix-web.
*   **Database**: Supabase (PostgreSQL).
*   **Auth**: Supabase Auth.

## 2. Data Schema (Supabase/Postgres)

### Tables

#### `nodes`
Base table for all entities to ensure unique IDs in the graph.
*   `id`: UUID (Primary Key)
*   `type`: ENUM ('QUESTION', 'OBJECTIVE', 'KEY_RESULT', 'FAILURE')
*   `created_at`: TIMESTAMPTZ
*   `updated_at`: TIMESTAMPTZ

#### `questions`
*   `id`: UUID (FK -> nodes.id)
*   `title`: TEXT
*   `content`: TEXT (Markdown)
*   `level`: SMALLINT (0, 1, 2)
*   `assets`: JSONB (Array of URLs)
*   `tags`: TEXT[]

#### `objectives`
*   `id`: UUID (FK -> nodes.id)
*   `title`: TEXT
*   `description`: TEXT
*   `status`: TEXT

#### `key_results`
*   `id`: UUID (FK -> nodes.id)
*   `objective_id`: UUID (FK -> objectives.id)
*   `title`: TEXT
*   `metric`: TEXT
*   `status`: TEXT

#### `links`
Adjacency list for the graph.
*   `source_id`: UUID (FK -> nodes.id)
*   `target_id`: UUID (FK -> nodes.id)
*   `type`: TEXT ('SUPPORTS', 'BLOCKS', 'RELATES')

## 3. API Contract (Draft)

### Graph Data
`GET /api/helix/graph`
Response:
```json
{
  "nodes": [{ "id": "...", "group": 1, "x": 0, "y": 0, ... }],
  "links": [{ "source": "...", "target": "..." }]
}
```

### Sedimentation
`POST /api/sediment`
Payload: `{ "failure_id": "...", "analysis": "..." }`
Logic:
1. Update Failure status to 'SEDIMENTED'.
2. Create new Question entry with content from analysis.
3. Return new Question ID.
