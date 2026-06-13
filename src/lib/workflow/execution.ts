import type { Node, Edge } from '@xyflow/react';
import type { BioSequence, FASTQRead } from '@/types/sequence';
import type { BioNodeData } from '@/types/workflow';
import { findORFs } from '@/lib/bio/orf-finder';
import { translate } from '@/lib/bio/translation';
import { calculateGC } from '@/lib/bio/gc-content';
import { reverseComplement } from '@/lib/bio/reverse-complement';
import { needlemanWunsch } from '@/lib/bio/needleman-wunsch';
import { searchMotif, searchCGRich } from '@/lib/bio/motif-search';
import { analyzeFASTQ } from '@/lib/bio/fastq-parser';
import { digestSequence } from '@/lib/bio/restriction-enzymes';
import { designPrimers } from '@/lib/bio/primer-design';
import { calculateCodonUsageWithRSCU } from '@/lib/bio/codon-usage';
import { calculateProteinProperties } from '@/lib/bio/protein-properties';

export interface ExecutionContext {
  sequences: BioSequence[];
  results: Map<string, unknown>;
  nodeCache: Map<string, { result: unknown; hash: string }>;
  executionOrder: string[];
}

function extractSequence(inputs: unknown[], fallback: BioSequence[]): string {
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input) && input.length > 0) {
      const first = input[0] as Record<string, unknown>;
      if (typeof first.sequence === 'string' && first.sequence.length > 0) {
        return first.sequence;
      }
      if (typeof first.header === 'string' && typeof first.sequence === 'string') {
        return first.sequence;
      }
    }
    if (typeof input === 'object' && input !== null) {
      const obj = input as Record<string, unknown>;
      if (typeof obj.sequence === 'string' && obj.sequence.length > 0) {
        return obj.sequence;
      }
      if (obj.accession && typeof obj.sequence === 'string') {
        return obj.sequence;
      }
      if ('upstream' in obj) {
        const u = (obj as Record<string, unknown>).upstream;
        if (Array.isArray(u)) {
          const found = extractSequence(u, []);
          if (found) return found;
        }
      }
    }
  }
  return fallback[0]?.sequence || '';
}

function hashNodeConfig(node: Node): string {
  const data = node.data as BioNodeData;
  return `${data.type}|${JSON.stringify(data.config)}`;
}

export async function executeWorkflow(
  nodes: Node[],
  edges: Edge[],
  sequences: BioSequence[],
  onNodeStatus: (nodeId: string, status: 'running' | 'complete' | 'error', results?: unknown) => void,
  cachedResults?: Map<string, { result: unknown; hash: string }>,
  changedNodeIds?: string[],
): Promise<ExecutionContext> {
  const ctx: ExecutionContext = {
    sequences,
    results: new Map(),
    nodeCache: cachedResults || new Map(),
    executionOrder: [],
  };

  const sorted = topologicalSort(nodes, edges);
  ctx.executionOrder = sorted;

  for (const nodeId of sorted) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const data = node.data as unknown as BioNodeData;
    const incomingEdges = edges.filter((e) => e.target === nodeId);
    const inputResults = incomingEdges.map((e) => ctx.results.get(e.source));

    const currentHash = hashNodeConfig(node);

    const upstreamChanged = changedNodeIds
      ? incomingEdges.some((e) => changedNodeIds.includes(e.source))
      : true;

    const cached = ctx.nodeCache.get(nodeId);
    if (cached && cached.hash === currentHash && !upstreamChanged) {
      ctx.results.set(nodeId, cached.result);
      onNodeStatus(nodeId, 'complete', cached.result);
      continue;
    }

    try {
      onNodeStatus(nodeId, 'running');
      await delay(200);

      let result: unknown = null;
      const seq = extractSequence(inputResults, sequences);

      switch (data.type) {
        case 'fasta-input': {
          const nodeSeq = data.config?.sequenceData as BioSequence[] | undefined;
          result = nodeSeq || sequences;
          break;
        }
        case 'fastq-input': {
          const reads = data.config?.reads as unknown[] | undefined;
          result = reads ? analyzeFASTQ(reads as FASTQRead[]) : null;
          break;
        }
        case 'genbank-input': {
          result = data.config?.genbankData || null;
          break;
        }
        case 'orf-finder': {
          const minLen = (data.config?.minOrfLength as number) || 30;
          result = seq ? findORFs(seq, minLen) : [];
          break;
        }
        case 'translation': {
          result = seq ? translate(seq) : { frames: [] };
          break;
        }
        case 'gc-content': {
          const window = (data.config?.windowSize as number) || 100;
          result = seq ? calculateGC(seq, window) : null;
          break;
        }
        case 'reverse-complement': {
          result = seq ? reverseComplement(seq) : '';
          break;
        }
        case 'alignment': {
          const seq2 = data.config?.sequence2 as string || '';
          const match = (data.config?.matchScore as number) || 2;
          const mismatch = (data.config?.mismatchScore as number) || -1;
          const gap = (data.config?.gapPenalty as number) || -2;
          if (seq && seq2) {
            result = needlemanWunsch(seq, seq2, match, mismatch, gap);
          } else {
            result = { error: 'Need two sequences for alignment' };
          }
          break;
        }
        case 'motif-search': {
          const motif = data.config?.motif as string || '';
          const regex = data.config?.useRegex as boolean || false;
          if (seq && motif) {
            if (motif.toLowerCase() === 'cg-rich' || motif === 'CG-rich') {
              const window = (data.config?.windowSize as number) || 50;
              const threshold = (data.config?.threshold as number) || 65;
              result = searchCGRich(seq, window, threshold);
            } else {
              result = searchMotif(seq, motif, regex);
            }
          } else {
            result = { motif, pattern: '', matches: [], totalMatches: 0 };
          }
          break;
        }
        case 'restriction-enzyme': {
          const enzymes = data.config?.enzymes as string[] | undefined;
          result = seq ? digestSequence(seq, enzymes) : { cuts: [], fragments: [], enzymeCounts: {}, totalCuts: 0 };
          break;
        }
        case 'primer-design': {
          result = seq ? designPrimers(seq) : { forward: [], reverse: [], pairs: [] };
          break;
        }
        case 'codon-usage': {
          result = seq ? calculateCodonUsageWithRSCU(seq) : { codons: [], rscuValues: {}, preferredCodons: [], rareCodons: [], heatmapData: [] };
          break;
        }
        case 'protein-properties': {
          result = seq ? calculateProteinProperties(seq) : null;
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
      ctx.nodeCache.set(nodeId, { result, hash: currentHash });
      onNodeStatus(nodeId, 'complete', result);
    } catch (error) {
      onNodeStatus(nodeId, 'error', error);
    }
  }

  return ctx;
}

export function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
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

export function buildDependencyMap(nodes: Node[], edges: Edge[]): Map<string, string[]> {
  const deps = new Map<string, string[]>();
  for (const n of nodes) deps.set(n.id, []);
  for (const e of edges) {
    deps.get(e.target)?.push(e.source);
  }
  return deps;
}

export function findDownstream(nodeId: string, edges: Edge[]): Set<string> {
  const downstream = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const e of edges) {
      if (e.source === current && !downstream.has(e.target)) {
        downstream.add(e.target);
        queue.push(e.target);
      }
    }
  }
  return downstream;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
