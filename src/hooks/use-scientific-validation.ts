import { useWorkflowStore } from '@/store/workflow-store';
import { useSequenceStore } from '@/store/sequence-store';
import type { BioNodeData } from '@/types/workflow';
import type {
  ORF, GCResult, AlignmentResult, MotifResult,
  RestrictionEnzymeResult, TranslationResult, PrimerDesignResult,
  CodonUsageResult, ProteinPropertiesResult, BioSequence,
} from '@/types/sequence';
import { validateORFList } from '@/lib/validation/orfValidation';
import { validateAlignment } from '@/lib/validation/alignmentValidation';
import { validateMotifResult } from '@/lib/validation/motifValidation';
import { validateGCResult } from '@/lib/validation/gcValidation';

interface NodeCheck {
  name: string;
  passed: boolean;
  message?: string;
}

interface NodeValidationResult {
  nodeId: string;
  type: string;
  label: string;
  status: string;
  checks: NodeCheck[];
}

export function useScientificValidation(): {
  nodeResults: NodeValidationResult[];
  seqStats: { header: string; length: number }[];
} {
  const nodes = useWorkflowStore((s) => s.nodes);
  const sequences = useSequenceStore((s) => s.sequences);

  const results: {
    nodeId: string;
    type: string;
    label: string;
    status: string;
    checks: { name: string; passed: boolean; message?: string }[];
  }[] = [];

  const fastaSequences: { header: string; seq: string }[] = [];

  for (const node of nodes) {
    const data = node.data as unknown as BioNodeData;
    const r = data.results;

    const checks: { name: string; passed: boolean; message?: string }[] = [];

    if (data.type === 'fasta-input') {
      const seqData = data.config?.sequenceData as string | undefined;
      const seqName = data.config?.sequenceName as string | undefined;
      if (seqData && seqData.length > 0) {
        const header = seqName || 'FASTA Input';
        fastaSequences.push({ header, seq: seqData });
        checks.push({ name: 'Sequence loaded', passed: true, message: `${seqData.length.toLocaleString()} bp from FASTA Input` });
      }
    }

    if (Array.isArray(r) && r.length > 0 && typeof r[0] === 'object' && 'start' in r[0]) {
      const orfs = r as ORF[];
      checks.push({ name: 'ORF count', passed: true, message: `${orfs.length} ORFs` });
      const errors = validateORFList(orfs);
      checks.push({ name: 'ORF validation', passed: errors.length === 0, message: errors.length > 0 ? errors[0] : 'All valid' });
      if (orfs.length > 0) {
        const maxAa = Math.max(...orfs.map((o) => o.lengthAa));
        const maxBp = Math.max(...orfs.map((o) => o.lengthBp));
        checks.push({ name: 'Longest ORF', passed: true, message: `${maxBp} bp / ${maxAa} aa` });
      }
    }

    if (typeof r === 'object' && r !== null && 'overall' in r) {
      const gc = r as GCResult;
      checks.push({ name: 'GC%', passed: true, message: `${gc.overall.toFixed(1)}%` });
      const errors = validateGCResult(gc);
      checks.push({ name: 'GC validation', passed: errors.length === 0, message: errors.length > 0 ? errors[0] : 'Valid' });
    }

    if (typeof r === 'object' && r !== null && 'aligned1' in r) {
      const al = r as AlignmentResult;
      checks.push({ name: 'Identity', passed: true, message: `${al.identityPercent.toFixed(1)}%` });
      checks.push({ name: 'Matches/Mismatches', passed: true, message: `${al.matches}/${al.mismatches}` });
      const errors = validateAlignment(al);
      checks.push({ name: 'Alignment validation', passed: errors.length === 0, message: errors.length > 0 ? errors[0] : 'Valid' });
    }

    if (typeof r === 'object' && r !== null && 'totalMatches' in r && 'matches' in r) {
      const m = r as MotifResult;
      checks.push({ name: 'Motif matches', passed: true, message: `${m.totalMatches} matches` });
      const errors = validateMotifResult(m);
      checks.push({ name: 'Motif validation', passed: errors.length === 0, message: errors.length > 0 ? errors[0] : 'Valid' });
    }

    if (typeof r === 'object' && r !== null && 'frames' in r) {
      const tr = r as TranslationResult;
      checks.push({ name: 'Translation frames', passed: true, message: `${tr.frames.length} frames` });
    }

    if (typeof r === 'object' && r !== null && 'totalCuts' in r) {
      const re = r as RestrictionEnzymeResult;
      checks.push({ name: 'Restriction cuts', passed: true, message: `${re.totalCuts} cuts` });
    }

    if (typeof r === 'object' && r !== null && 'forward' in r && 'pairs' in r) {
      const pd = r as PrimerDesignResult;
      checks.push({ name: 'Primer pairs', passed: true, message: `${pd.pairs.length} pairs` });
    }

    if (typeof r === 'object' && r !== null && 'preferredCodons' in r) {
      const cu = r as CodonUsageResult;
      checks.push({ name: 'Codon usage', passed: true, message: `${cu.codons.length} codons` });
    }

    if (typeof r === 'object' && r !== null && 'molecularWeight' in r) {
      const pp = r as ProteinPropertiesResult;
      checks.push({ name: 'Mol. weight', passed: true, message: `${(pp.molecularWeight / 1000).toFixed(1)} kDa` });
    }

    if (Array.isArray(r) && r.length > 0 && typeof r[0] === 'object' && 'sequence' in r[0] && 'header' in r[0]) {
      const seqs = r as BioSequence[];
      checks.push({ name: 'Sequences', passed: true, message: `${seqs.length} sequence(s), longest ${Math.max(...seqs.map((s) => s.length)).toLocaleString()} bp` });
    }

    results.push({
      nodeId: node.id,
      type: data.type,
      label: data.label,
      status: data.status,
      checks,
    });
  }

  const seqStats = [
    ...sequences.map((s) => ({
      header: s.header,
      length: s.length,
    })),
    ...fastaSequences.map((s) => ({
      header: s.header,
      length: s.seq.length,
    })),
  ];

  return { nodeResults: results, seqStats };
}
