import type { NodeDefinition } from '@/types/workflow';

export const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    type: 'fasta-input',
    label: 'FASTA Input',
    description: 'Load FASTA formatted sequences',
    icon: 'FileInput',
    category: 'input',
    color: '#22C55E',
  },
  {
    type: 'fastq-input',
    label: 'FASTQ Input',
    description: 'Load FASTQ formatted reads',
    icon: 'FileInput',
    category: 'input',
    color: '#22C55E',
  },
  {
    type: 'genbank-input',
    label: 'GenBank Input',
    description: 'Load GenBank annotated sequences',
    icon: 'FileInput',
    category: 'input',
    color: '#22C55E',
  },
  {
    type: 'gc-content',
    label: 'GC Content',
    description: 'Calculate GC and AT content',
    icon: 'Percent',
    category: 'analysis',
    color: '#3B82F6',
  },
  {
    type: 'orf-finder',
    label: 'ORF Finder',
    description: 'Detect open reading frames',
    icon: 'ScanSearch',
    category: 'analysis',
    color: '#8B5CF6',
  },
  {
    type: 'translation',
    label: 'Translation',
    description: 'Translate DNA to protein',
    icon: 'ArrowRightToLine',
    category: 'analysis',
    color: '#F59E0B',
  },
  {
    type: 'reverse-complement',
    label: 'Reverse Complement',
    description: 'Generate reverse complement',
    icon: 'ArrowLeftRight',
    category: 'analysis',
    color: '#3B82F6',
  },
  {
    type: 'alignment',
    label: 'Alignment',
    description: 'Sequence alignment',
    icon: 'AlignStartVertical',
    category: 'analysis',
    color: '#8B5CF6',
  },
  {
    type: 'motif-search',
    label: 'Motif Search',
    description: 'Search for sequence motifs',
    icon: 'Search',
    category: 'analysis',
    color: '#F59E0B',
  },
  {
    type: 'report',
    label: 'Report',
    description: 'Generate analysis report',
    icon: 'FileText',
    category: 'output',
    color: '#EF4444',
  },
  {
    type: 'csv-export',
    label: 'CSV Export',
    description: 'Export data as CSV',
    icon: 'Table',
    category: 'output',
    color: '#EF4444',
  },
  {
    type: 'sequence-viewer',
    label: 'Sequence Viewer',
    description: 'View sequence with annotations',
    icon: 'Eye',
    category: 'output',
    color: '#EF4444',
  },
];

export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return NODE_DEFINITIONS.find((d) => d.type === type);
}
