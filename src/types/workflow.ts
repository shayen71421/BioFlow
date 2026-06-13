export type NodeCategory = 'input' | 'analysis' | 'output';

export type NodeType =
  | 'fasta-input'
  | 'fastq-input'
  | 'genbank-input'
  | 'gc-content'
  | 'orf-finder'
  | 'translation'
  | 'reverse-complement'
  | 'alignment'
  | 'motif-search'
  | 'report'
  | 'csv-export'
  | 'sequence-viewer';

export type NodeStatus = 'idle' | 'running' | 'complete' | 'error';

 
export interface BioNodeData extends Record<string, unknown> {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  category: NodeCategory;
  status: NodeStatus;
  config: Record<string, unknown>;
  results?: unknown;
}

export interface WorkflowMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export type ValidationResult = {
  valid: boolean;
  reason?: string;
};

export interface WorkflowHistoryEntry {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type: NodeType | string;
  position: { x: number; y: number };
  data: BioNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface NodeDefinition {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  category: NodeCategory;
  color: string;
}
