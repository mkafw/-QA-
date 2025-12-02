

// Domain Types

export enum LearningLevel {
  L0_TOOL = 0,    // Tool/Prompt Level
  L1_PATTERN = 1, // Mechanism/Principle Level
  L2_SELF = 2     // Architecture/Design Level
}

export enum EntityType {
  QUESTION = 'QUESTION',
  OBJECTIVE = 'OBJECTIVE',
  KEY_RESULT = 'KEY_RESULT',
  FAILURE = 'FAILURE'
}

export interface NodeBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// QA Core
export interface Question extends NodeBase {
  type: EntityType.QUESTION;
  title: string;
  content: string; // Markdown supported answer
  level: LearningLevel;
  tags: string[];
  // Assets managed by '@'
  assets?: string[]; // URLs to images
  // Bi-directional links managed by '[[]]'
  linkedQuestionIds: string[];
  linkedOKRIds: string[]; 
  status: 'Draft' | 'Answered' | 'Verified';
}

// OKR Core
export interface KeyResult extends NodeBase {
  type: EntityType.KEY_RESULT;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  metric: string; // e.g., "3 working prototypes"
  linkedQuestionIds: string[]; // Questions blocking or related to this KR
}

export interface Objective extends NodeBase {
  type: EntityType.OBJECTIVE;
  title: string;
  description: string;
  keyResults: KeyResult[];
  linkedQuestionIds: string[]; // High-level questions this O addresses
}

// Failure Sedimentation
export interface Failure extends NodeBase {
  type: EntityType.FAILURE;
  description: string;
  analysis5W2H: string;
  relatedKRId?: string;
  convertedToQuestionId?: string; // If null, pending conversion
  status: 'New' | 'Analyzed' | 'Sedimented';
}

// Graph Visualization Types
export interface GraphNode {
  id: string;
  group: number; // 1: Question, 2: Objective, 3: KR
  label: string;
  level?: number;
  val: number; // Size
  // Enriched data for Popup/Card
  content?: string;
  assets?: string[];
  tags?: string[];
  // D3 Simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'related' | 'supports' | 'blocks';
}

// Dev Log & Iteration Tracking
export interface Iteration {
  id: string;
  hash: string;
  timestamp: string;
  message: string;
  changes: {
    added: number;
    modified: number;
    sedimented: number;
  };
  contextSummary: string; // The "AI Context" for this state
}

// View Context
export enum ViewMode {
  QA_FIRST = 'QA_FIRST',
  OKR_FIRST = 'OKR_FIRST',
  GRAPH = 'GRAPH',
  FAILURE_QUEUE = 'FAILURE_QUEUE'
}