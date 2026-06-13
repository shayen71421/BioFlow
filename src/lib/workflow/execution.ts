import type { Node, Edge } from '@xyflow/react';
import type { BioSequence } from '@/types/sequence';
import type { BioNodeData } from '@/types/workflow';
import { findORFs } from '@/lib/bio/orf-finder';
import { translate } from '@/lib/bio/translation';
import { calculateGC } from '@/lib/bio/gc-content';
import { reverseComplement } from '@/lib/bio/reverse-complement';

export interface ExecutionContext {
  sequences: BioSequence[];
  results: Map<string, unknown>;
}

function extractSequence(inputs: unknown[], fallback: BioSequence[]): string {
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input) && input.length > 0) {
      const first = input[0] as Record<string, unknown>;
      if (typeof first.sequence === 'string' && first.sequence.length > 0) {
        return first.sequence;
      }
    }
    if (typeof input === 'object' && input !== null && 'upstream' in input) {
      const u = (input as Record<string, unknown>).upstream;
      if (Array.isArray(u)) {
        const found = extractSequence(u, []);
        if (found) return found;
      }
    }
  }
  return fallback[0]?.sequence || '';
}

export async function executeWorkflow(
  nodes: Node[],
  edges: Edge[],
  sequences: BioSequence[],
  onNodeStatus: (nodeId: string, status: 'running' | 'complete' | 'error', results?: unknown) => void,
): Promise<ExecutionContext> {
  const ctx: ExecutionContext = { sequences, results: new Map() };
  const sorted = topologicalSort(nodes, edges);

  for (const nodeId of sorted) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const data = node.data as unknown as BioNodeData;
    const incomingEdges = edges.filter((e) => e.target === nodeId);
    const inputResults = incomingEdges.map((e) => ctx.results.get(e.source));

    try {
      onNodeStatus(nodeId, 'running');
      await delay(300);

      let result: unknown = null;
      const seq = extractSequence(inputResults, sequences);

      switch (data.type) {
        case 'fasta-input': {
          const nodeSeq = data.config?.sequenceData as BioSequence[] | undefined;
          result = nodeSeq || sequences;
          break;
        }
        case 'orf-finder': {
          const minLen = (data.config?.minOrfLength as number) || 30;
          result = findORFs(seq, minLen);
          break;
        }
        case 'translation': {
          result = translate(seq);
          break;
        }
        case 'gc-content': {
          const window = (data.config?.windowSize as number) || 100;
          result = calculateGC(seq, window);
          break;
        }
        case 'reverse-complement': {
          result = reverseComplement(seq);
          break;
        }
        case 'report':
        case 'csv-export':
        case 'sequence-viewer': {
          result = { upstream: inputResults };
          break;
        }
        default: {
          result = inputResults[0] || null;
        }
      }

      ctx.results.set(nodeId, result);
      onNodeStatus(nodeId, 'complete', result);
    } catch (error) {
      onNodeStatus(nodeId, 'error', error);
    }
  }

  return ctx;
}

function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();

  for (const n of nodes) {
    adj.set(n.id, []);
    inDeg.set(n.id, 0);
  }
  for (const e of edges) {
    adj.get(e.source)?.push(e.target);
    inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1);
  }

  const q: string[] = [];
  for (const [id, d] of inDeg) {
    if (d === 0) q.push(id);
  }

  const out: string[] = [];
  while (q.length > 0) {
    const id = q.shift()!;
    out.push(id);
    for (const n of adj.get(id) || []) {
      const nd = (inDeg.get(n) || 0) - 1;
      inDeg.set(n, nd);
      if (nd === 0) q.push(n);
    }
  }
  return out;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
