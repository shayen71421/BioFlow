import type { NodeType, ValidationResult } from '@/types/workflow';

const INPUT_NODES: Set<NodeType> = new Set(['fasta-input', 'fastq-input', 'genbank-input']);
const ANALYSIS_NODES: Set<NodeType> = new Set([
  'gc-content', 'orf-finder', 'translation',
  'reverse-complement', 'alignment', 'alignment-local', 'motif-search',
]);
const ADVANCED_NODES: Set<NodeType> = new Set([
  'restriction-enzyme', 'primer-design', 'codon-usage', 'protein-properties',
]);
const OUTPUT_NODES: Set<NodeType> = new Set(['report', 'csv-export', 'sequence-viewer']);

export function getNodeCategory(type: string): 'input' | 'analysis' | 'advanced-analysis' | 'output' {
  if (INPUT_NODES.has(type as NodeType)) return 'input';
  if (ANALYSIS_NODES.has(type as NodeType)) return 'analysis';
  if (ADVANCED_NODES.has(type as NodeType)) return 'advanced-analysis';
  if (OUTPUT_NODES.has(type as NodeType)) return 'output';
  return 'analysis';
}

export function validateConnection(
  sourceType: string,
  targetType: string,
): ValidationResult {
  const sourceCat = getNodeCategory(sourceType);
  const targetCat = getNodeCategory(targetType);

  if (sourceCat === 'output') {
    return { valid: false, reason: 'Output nodes cannot have outgoing connections.' };
  }

  if (targetCat === 'input') {
    return { valid: false, reason: 'Input nodes cannot have incoming connections.' };
  }

  if (sourceType === targetType && (sourceCat === 'analysis' || sourceCat === 'advanced-analysis')) {
    return { valid: false, reason: 'Cannot connect a node to itself.' };
  }

  return { valid: true };
}

export function validateWorkflow(nodes: { type: string }[]): ValidationResult {
  const hasInput = nodes.some((n) => INPUT_NODES.has(n.type as NodeType));
  if (!hasInput) {
    return { valid: false, reason: 'Workflow must include at least one input node (FASTA/FASTQ/GenBank).' };
  }

  const hasOutput = nodes.some((n) => OUTPUT_NODES.has(n.type as NodeType));
  if (!hasOutput) {
    return { valid: false, reason: 'Workflow should include at least one output node (Report/CSV/Sequence Viewer).' };
  }

  return { valid: true };
}
