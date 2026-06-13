import type { Node, Edge } from '@xyflow/react';
import type { BioNodeData } from '@/types/workflow';

function getFlagForNode(type: string): { flag: string; value?: string } | null {
  switch (type) {
    case 'fasta-input': return { flag: '--input', value: 'sequence.fasta' };
    case 'fastq-input': return { flag: '--input', value: 'reads.fastq' };
    case 'genbank-input': return { flag: '--input', value: 'sequence.gb' };
    case 'orf-finder': return { flag: '--orf' };
    case 'translation': return { flag: '--translate' };
    case 'gc-content': return { flag: '--gc' };
    case 'reverse-complement': return { flag: '--revcomp' };
    case 'alignment': return { flag: '--align' };
    case 'motif-search': return { flag: '--motif' };
    case 'restriction-enzyme': return { flag: '--restrict' };
    case 'primer-design': return { flag: '--primers' };
    case 'codon-usage': return { flag: '--codon-usage' };
    case 'protein-properties': return { flag: '--protein-prop' };
    case 'report': return { flag: '--report' };
    case 'csv-export': return { flag: '--csv' };
    case 'sequence-viewer': return { flag: '--view' };
    default: return null;
  }
}

export function exportToCommand(nodes: Node[], edges: Edge[]): string {
  const sorted = topologicalSort(nodes, edges);
  const flags: string[] = [];

  for (const nodeId of sorted) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;
    const nodeData = node.data as BioNodeData;
    const cmdFlag = getFlagForNode(nodeData.type || '');
    if (cmdFlag) {
      flags.push(cmdFlag.value ? `${cmdFlag.flag} ${cmdFlag.value}` : cmdFlag.flag);
    }
  }

  return 'bioflow run \\\n  ' + flags.join(' \\\n  ');
}

function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    adj.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [node, deg] of inDegree) {
    if (deg === 0) queue.push(node);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    sorted.push(node);
    for (const neighbor of adj.get(node) || []) {
      const newDeg = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return sorted;
}
