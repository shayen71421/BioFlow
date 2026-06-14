'use client';

import { create } from 'zustand';
import type { BioSequence, ORF, GCResult, TranslationResult, SequenceStats } from '@/types/sequence';
import { parseFasta } from '@/lib/bio/fasta-parser';
import { findORFsInSixFrames } from '@/lib/bio/orf-finder';
import { translate } from '@/lib/bio/translation';
import { calculateGC } from '@/lib/bio/gc-content';
import { reverseComplement } from '@/lib/bio/reverse-complement';
import { getSequenceStats } from '@/lib/bio/codon-usage';
import type { ExampleSequence } from '@/types/sequence';

interface SequenceState {
  sequences: BioSequence[];
  activeSequenceId: string | null;
  orfs: ORF[];
  gcResult: GCResult | null;
  translationResult: TranslationResult | null;
  revComp: string | null;
  stats: SequenceStats | null;

  loadFasta: (text: string) => void;
  loadExample: (example: ExampleSequence) => void;
  setActiveSequence: (id: string) => void;
  analyzeCurrent: () => void;
  clearData: () => void;
  setOrfMinLength: (min: number) => void;
  getActiveSequence: () => BioSequence | null;
}

export const useSequenceStore = create<SequenceState>()((set, get) => ({
  sequences: [],
  activeSequenceId: null,
  orfs: [],
  gcResult: null,
  translationResult: null,
  revComp: null,
  stats: null,

  loadFasta: (text: string) => {
    const parsed = parseFasta(text);
    if (parsed.length === 0) return;

    set({
      sequences: parsed,
      activeSequenceId: parsed[0].id,
      orfs: [],
      gcResult: null,
      translationResult: null,
      revComp: null,
      stats: null,
    });

    get().analyzeCurrent();
  },

  loadExample: (example: ExampleSequence) => {
    const seq: BioSequence = {
      id: example.id,
      header: example.header,
      sequence: example.sequence,
      length: example.sequence.length,
    };

    set({
      sequences: [seq],
      activeSequenceId: seq.id,
      orfs: [],
      gcResult: null,
      translationResult: null,
      revComp: null,
      stats: null,
    });

    get().analyzeCurrent();
  },

  setActiveSequence: (id: string) => {
    set({
      activeSequenceId: id,
      orfs: [],
      gcResult: null,
      translationResult: null,
      revComp: null,
      stats: null,
    });
    get().analyzeCurrent();
  },

  analyzeCurrent: () => {
    const seq = get().getActiveSequence();
    if (!seq) return;

    const sequence = seq.sequence;
    const orfs = findORFsInSixFrames(sequence, 30);
    const gcResult = calculateGC(sequence, 100);
    const translationResult = translate(sequence, [0, 1, 2]);
    const revComp = reverseComplement(sequence);
    const rawStats = getSequenceStats(sequence);
    const stats: SequenceStats = {
      length: rawStats.length,
      gcPercent: rawStats.gcPercent,
      atPercent: rawStats.atPercent,
      orfCount: orfs.length,
      codonCount: Math.floor(sequence.length / 3),
      nucleotides: {
        A: rawStats.A,
        T: rawStats.T,
        G: rawStats.G,
        C: rawStats.C,
        N: rawStats.N,
      },
    };

    set({ orfs, gcResult, translationResult, revComp, stats });
  },

  clearData: () => {
    set({
      sequences: [],
      activeSequenceId: null,
      orfs: [],
      gcResult: null,
      translationResult: null,
      revComp: null,
      stats: null,
    });
  },

  setOrfMinLength: (min: number) => {
    const seq = get().getActiveSequence();
    if (!seq) return;
    const orfs = findORFsInSixFrames(seq.sequence, min);
    set({ orfs });
  },

  getActiveSequence: () => {
    const { sequences, activeSequenceId } = get();
    if (!activeSequenceId || sequences.length === 0) return null;
    return sequences.find((s) => s.id === activeSequenceId) || sequences[0];
  },
}));
