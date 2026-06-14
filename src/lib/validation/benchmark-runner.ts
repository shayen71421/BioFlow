import type { BenchmarkCase } from './benchmark-data';
import { calculateGC } from '@/lib/bio/gc-content';
import { translate } from '@/lib/bio/translation';
import { findORFs } from '@/lib/bio/orf-finder';
import { findORFsInSixFrames } from '@/lib/bio/orf-finder';
import { searchMotif } from '@/lib/bio/motif-search';
import { digestSequence } from '@/lib/bio/restriction-enzymes';
import { reverseComplement } from '@/lib/bio/reverse-complement';
import { needlemanWunsch } from '@/lib/bio/needleman-wunsch';
import { parseFasta } from '@/lib/bio/fasta-parser';
import { calcTm } from '@/lib/bio/primer-design';
import { calculateProteinProperties } from '@/lib/bio/protein-properties';

export interface BenchmarkResult {
  id: string;
  name: string;
  category: string;
  description: string;
  input: Record<string, string>;
  passed: boolean;
  actual: string;
  expected: string;
  detail: string;
}

function checkField(actual: Record<string, unknown>, key: string, expectedVal: unknown, path: string = ''): string | null {
  const actualVal = actual[key];
  if (typeof expectedVal === 'number') {
    if (typeof actualVal !== 'number') return `${path}${key}: expected number, got ${typeof actualVal}`;
    if (Math.abs(actualVal - expectedVal) > 0.01) {
      return `${path}${key}: expected ${expectedVal}, got ${actualVal}`;
    }
    return null;
  }
  if (typeof expectedVal === 'string') {
    if (actualVal !== expectedVal) return `${path}${key}: expected "${expectedVal}", got "${actualVal}"`;
    return null;
  }
  if (typeof expectedVal === 'boolean') {
    if (actualVal !== expectedVal) return `${path}${key}: expected ${expectedVal}, got ${actualVal}`;
    return null;
  }
  return null;
}

export function runBenchmark(testCase: BenchmarkCase): BenchmarkResult {
  const { id, name, category, description, input, expected } = testCase;
  const errors: string[] = [];

  try {
    switch (category) {
      case 'GC Content': {
        const seq = input['sequence'] || '';
        const result = calculateGC(seq);
        const data: Record<string, unknown> = { overall: result.overall, gcCount: result.gcCount, total: result.total };
        for (const [key, val] of Object.entries(expected)) {
          const err = checkField(data, key, val);
          if (err) errors.push(err);
        }
        if (errors.length === 0) {
          return { id, name, category, description, input, passed: true, actual: `GC=${result.overall.toFixed(1)}% (${result.gcCount}/${result.total})`, expected: JSON.stringify(expected), detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: `GC=${result.overall.toFixed(1)}%`, expected: JSON.stringify(expected), detail: errors.join('; ') };
      }

      case 'Translation': {
        const seq = input['sequence'] || '';
        const result = translate(seq, [0, 1, 2]);
        const data: Record<string, unknown> = {};
        for (let f = 0; f < result.frames.length; f++) {
          data[`frame${f}`] = result.frames[f].aa;
        }
        for (const [key, val] of Object.entries(expected)) {
          const err = checkField(data, key, val);
          if (err) errors.push(err);
        }
        if (errors.length === 0) {
          const aas = result.frames.map((f) => `${f.frame}:${f.aa}`).join(', ');
          return { id, name, category, description, input, passed: true, actual: aas, expected: JSON.stringify(expected), detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: JSON.stringify(data), expected: JSON.stringify(expected), detail: errors.join('; ') };
      }

      case 'ORF Finder': {
        const seq = input['sequence'] || '';
        const minLen = parseInt(input['minLength'] || '30');
        const orfs = findORFs(seq, minLen);
        const data: Record<string, unknown> = { orfCount: orfs.length };
        if (orfs.length > 0) {
          data['firstStart'] = orfs[0].start;
          data['firstEnd'] = orfs[0].end;
          data['firstFrame'] = orfs[0].frame;
        }
        if ('sixFrameOrfCount' in expected) {
          const sixFrame = findORFsInSixFrames(seq, minLen);
          data['sixFrameOrfCount'] = sixFrame.length;
        }
        for (const [key, val] of Object.entries(expected)) {
          const err = checkField(data, key, val);
          if (err) errors.push(err);
        }
        if (errors.length === 0) {
          const displayCount = 'sixFrameOrfCount' in expected ? (data['sixFrameOrfCount'] as number) : orfs.length;
          return { id, name, category, description, input, passed: true, actual: `${displayCount} ORF(s)`, expected: JSON.stringify(expected), detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: JSON.stringify(data), expected: JSON.stringify(expected), detail: errors.join('; ') };
      }

      case 'Motif Search': {
        const seq = input['sequence'] || '';
        const motif = input['motif'] || '';
        const result = searchMotif(seq, motif);
        const data: Record<string, unknown> = { totalMatches: result.totalMatches };
        if (result.matches.length > 0) {
          data['matchSequence'] = result.matches[0].sequence;
        }
        for (const [key, val] of Object.entries(expected)) {
          const err = checkField(data, key, val);
          if (err) errors.push(err);
        }
        if (errors.length === 0) {
          return { id, name, category, description, input, passed: true, actual: `${result.totalMatches} match(es)`, expected: JSON.stringify(expected), detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: JSON.stringify(data), expected: JSON.stringify(expected), detail: errors.join('; ') };
      }

      case 'Restriction Enzymes': {
        const seq = input['sequence'] || '';
        const enzymes = input['enzymes'] || '';
        const result = digestSequence(seq, enzymes ? enzymes.split(',') : undefined);
        const data: Record<string, unknown> = { totalCuts: result.totalCuts };
        if (result.cuts.length > 0) {
          data['firstCutPosition'] = result.cuts[0].cutPosition;
          data['firstEnzyme'] = result.cuts[0].enzyme;
        }
        if ('fragments' in expected) {
          data['fragments'] = result.fragments;
        }
        for (const [key, val] of Object.entries(expected)) {
          if (key === 'fragments') {
            const exp = val as number[];
            const act = result.fragments;
            if (JSON.stringify(exp) !== JSON.stringify(act)) {
              errors.push(`fragments: expected [${exp.join(',')}], got [${act.join(',')}]`);
            }
          } else {
            const err = checkField(data, key, val);
            if (err) errors.push(err);
          }
        }
        if (errors.length === 0) {
          let detail = `${result.totalCuts} cut(s)`;
          if (result.cuts.length > 0) detail += '; ' + result.cuts.map((c) => `${c.enzyme}@${c.cutPosition}`).join(', ');
          return { id, name, category, description, input, passed: true, actual: detail, expected: JSON.stringify(expected), detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: JSON.stringify(data), expected: JSON.stringify(expected), detail: errors.join('; ') };
      }

      case 'Reverse Complement': {
        const seq = input['sequence'] || '';
        const result = reverseComplement(seq);
        const expectedRC = expected['reverseComplement'] as string;
        if (result === expectedRC) {
          return { id, name, category, description, input, passed: true, actual: result, expected: expectedRC, detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: result, expected: expectedRC, detail: `expected "${expectedRC}", got "${result}"` };
      }

      case 'Alignment': {
        const q1 = input['seq1'] || '';
        const q2 = input['seq2'] || '';
        const result = needlemanWunsch(q1, q2);
        const data: Record<string, unknown> = {
          identity: result.identity,
          identityPercent: result.identityPercent,
          matches: result.matches,
          mismatches: result.mismatches,
          gaps: result.gaps,
        };
        for (const [key, val] of Object.entries(expected)) {
          const err = checkField(data, key, val);
          if (err) errors.push(err);
        }
        if (errors.length === 0) {
          return { id, name, category, description, input, passed: true, actual: `identity=${result.identityPercent.toFixed(1)}%, ${result.matches}M/${result.mismatches}MM/${result.gaps}G`, expected: JSON.stringify(expected), detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: JSON.stringify(data), expected: JSON.stringify(expected), detail: errors.join('; ') };
      }

      case 'FASTA Parser': {
        const fasta = input['fasta'] || '';
        const result = parseFasta(fasta);
        const data: Record<string, unknown> = { count: result.length };
        if (result.length > 0) {
          data['firstHeader'] = result[0].header;
          data['firstSeq'] = result[0].sequence;
        }
        for (const [key, val] of Object.entries(expected)) {
          const err = checkField(data, key, val);
          if (err) errors.push(err);
        }
        if (errors.length === 0) {
          return { id, name, category, description, input, passed: true, actual: `${result.length} record(s)`, expected: JSON.stringify(expected), detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: JSON.stringify(data), expected: JSON.stringify(expected), detail: errors.join('; ') };
      }

      case 'Primer Design': {
        const primerSeq = input['primer'] || '';
        const tm = calcTm(primerSeq);
        const expectedTm = expected['primerTm'] as number;
        if (Math.abs(tm - expectedTm) < 0.01) {
          return { id, name, category, description, input, passed: true, actual: `Tm=${tm.toFixed(1)}°C`, expected: `${expectedTm}°C`, detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: `Tm=${tm.toFixed(1)}°C`, expected: `${expectedTm}°C`, detail: `Tm mismatch` };
      }

      case 'Protein Properties': {
        const seq = input['sequence'] || '';
        const result = calculateProteinProperties(seq);
        if (result.molecularWeight >= (expected['minMW'] as number) && result.molecularWeight <= (expected['maxMW'] as number)) {
          return { id, name, category, description, input, passed: true, actual: `MW=${result.molecularWeight.toFixed(1)} Da`, expected: `${expected['minMW']}-${expected['maxMW']} Da`, detail: '' };
        }
        return { id, name, category, description, input, passed: false, actual: `MW=${result.molecularWeight.toFixed(1)} Da`, expected: JSON.stringify(expected), detail: `MW ${result.molecularWeight.toFixed(1)} outside expected range` };
      }

      default:
        return { id, name, category, description, input, passed: false, actual: '', expected: '', detail: `Unknown category: ${category}` };
    }
  } catch (err) {
    return { id, name, category, description, input, passed: false, actual: `Error: ${err}`, expected: JSON.stringify(expected), detail: String(err) };
  }
}
