import type { PrimerCandidate, PrimerDesignResult } from '@/types/sequence';

const MIN_TM = 50;
const MAX_TM = 65;
const MIN_GC = 40;
const MAX_GC = 60;
const MIN_LENGTH = 18;
const MAX_LENGTH = 28;
const PRODUCT_MIN = 100;
const PRODUCT_MAX = 2000;

function calcTm(seq: string): number {
  const s = seq.toUpperCase();
  const len = s.length;
  let at = 0, gc = 0;
  for (const b of s) {
    if (b === 'A' || b === 'T') at++;
    else if (b === 'G' || b === 'C') gc++;
  }
  if (len < 14) return 2 * at + 4 * gc;
  return 64.9 + 41 * (gc - 16.4) / len;
}

function calcGC(seq: string): number {
  const s = seq.toUpperCase();
  let gc = 0;
  for (const b of s) {
    if (b === 'G' || b === 'C') gc++;
  }
  return s.length > 0 ? (gc / s.length) * 100 : 0;
}

function calcHairpin(seq: string): number {
  const s = seq.toUpperCase();
  const len = s.length;
  for (let i = 0; i < len - 3; i++) {
    for (let j = i + 3; j < len; j++) {
      if (s[i] === s[j] && s[i + 1] === s[j - 1]) {
        return (len - j + i) * 1.5;
      }
    }
  }
  return 0;
}

function calcSelfDimer(seq: string): number {
  const s = seq.toUpperCase();
  const rev = s.split('').reverse().join('');
  let score = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === rev[i] && s[i] !== 'N') score += 2;
  }
  return score;
}

function generatePrimers(seq: string, start: number, end: number, reverse: boolean): PrimerCandidate[] {
  const candidates: PrimerCandidate[] = [];
  const region = reverse
    ? seq.slice(start, end).split('').reverse().join('')
    : seq.slice(start, end);

  const minIdx = 0;
  const maxIdx = region.length - MIN_LENGTH;

  for (let i = minIdx; i <= maxIdx; i++) {
    for (let len = MIN_LENGTH; len <= Math.min(MAX_LENGTH, region.length - i); len++) {
      const primer = region.slice(i, i + len);
      const gc = calcGC(primer);
      const tm = calcTm(primer);
      const hairpin = calcHairpin(primer);
      const dimer = calcSelfDimer(primer);

      if (gc >= MIN_GC && gc <= MAX_GC && tm >= MIN_TM && tm <= MAX_TM) {
        const pStart = reverse ? end - i - len : start + i;
        candidates.push({
          seq: primer,
          start: pStart,
          end: pStart + len,
          length: len,
          gcPercent: gc,
          tm,
          reverse,
          hairpinTm: hairpin,
          selfDimer: dimer,
        });
      }
    }
  }

  candidates.sort((a, b) => {
    const scoreA = Math.abs(a.tm - 58) + Math.abs(a.gcPercent - 50) + a.hairpinTm + a.selfDimer;
    const scoreB = Math.abs(b.tm - 58) + Math.abs(b.gcPercent - 50) + b.hairpinTm + b.selfDimer;
    return scoreA - scoreB;
  });

  return candidates.slice(0, 20);
}

export function designPrimers(sequence: string): PrimerDesignResult {
  const seq = sequence.toUpperCase();
  const len = seq.length;

  const fwdStart = 0;
  const fwdEnd = Math.min(200, Math.floor(len / 2));
  const revStart = Math.max(Math.floor(len / 2), len - 200);
  const revEnd = len;

  const forward = generatePrimers(seq, fwdStart, fwdEnd, false);
  const reverse = generatePrimers(seq, revStart, revEnd, true);

  const pairs: { forward: PrimerCandidate; reverse: PrimerCandidate; productSize: number; tmDiff: number }[] = [];

  for (const f of forward.slice(0, 5)) {
    for (const r of reverse.slice(0, 5)) {
      const productSize = r.start - f.end;
      if (productSize >= PRODUCT_MIN && productSize <= PRODUCT_MAX) {
        pairs.push({
          forward: f,
          reverse: r,
          productSize,
          tmDiff: Math.abs(f.tm - r.tm),
        });
      }
    }
  }

  pairs.sort((a, b) => a.tmDiff - b.tmDiff);

  return { forward, reverse, pairs: pairs.slice(0, 10) };
}
