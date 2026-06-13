import type { NodeType } from '@/types/workflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data?: Record<string, unknown>;
  }>;
  edges: Array<{
    source: string;
    target: string;
  }>;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'fasta-exploration',
    name: 'FASTA Exploration',
    description: 'Load a FASTA file, find open reading frames, and analyze GC content.',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 } },
      { id: '2', type: 'orf-finder', position: { x: 300, y: 220 } },
      { id: '3', type: 'gc-content', position: { x: 300, y: 390 } },
      { id: '4', type: 'sequence-viewer', position: { x: 300, y: 560 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '2', target: '4' },
      { source: '3', target: '4' },
    ],
  },
  {
    id: 'protein-translation',
    name: 'Protein Translation',
    description: 'Translate a DNA sequence to protein and generate a report.',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 } },
      { id: '2', type: 'translation', position: { x: 300, y: 220 } },
      { id: '3', type: 'report', position: { x: 300, y: 390 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
    ],
  },
  {
    id: 'genome-overview',
    name: 'Genome Overview',
    description: 'Complete genome analysis pipeline: ORFs, translation, and GC content.',
    nodes: [
      { id: '1', type: 'fasta-input', position: { x: 300, y: 50 } },
      { id: '2', type: 'orf-finder', position: { x: 50, y: 220 } },
      { id: '3', type: 'translation', position: { x: 550, y: 220 } },
      { id: '4', type: 'gc-content', position: { x: 300, y: 390 } },
      { id: '5', type: 'report', position: { x: 300, y: 560 } },
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '1', target: '3' },
      { source: '1', target: '4' },
      { source: '2', target: '5' },
      { source: '3', target: '5' },
      { source: '4', target: '5' },
    ],
  },
];
