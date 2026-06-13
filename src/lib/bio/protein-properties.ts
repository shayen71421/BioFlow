import type { ProteinPropertiesResult } from '@/types/sequence';

const AA_MASSES: Record<string, number> = {
  A: 71.08, R: 156.19, N: 114.10, D: 115.09, C: 103.14,
  Q: 128.13, E: 129.12, G: 57.05, H: 137.14, I: 113.16,
  L: 113.16, K: 128.17, M: 131.19, F: 147.18, P: 97.12,
  S: 87.08, T: 101.10, W: 186.21, Y: 163.18, V: 99.13,
};

const AA_HYDROPHOBICITY: Record<string, number> = {
  I: 4.5, V: 4.2, L: 3.8, F: 2.8, C: 2.5, M: 1.9, A: 1.8,
  G: -0.4, T: -0.7, S: -0.8, W: -0.9, Y: -1.3, P: -1.6, H: -3.2,
  E: -3.5, Q: -3.5, D: -3.5, N: -3.5, K: -3.9, R: -4.5,
};

const AA_PKA: Record<string, number> = {
  C: 8.14, D: 3.90, E: 4.07, H: 6.04, K: 10.54,
  R: 12.48, Y: 10.46,
};

const AA_EXTINCTION: Record<string, { reduced: number; oxidized: number }> = {
  W: { reduced: 5500, oxidized: 5690 },
  Y: { reduced: 1490, oxidized: 1280 },
};

const AA_AROMATIC = new Set(['F', 'Y', 'W']);

export function calculateProteinProperties(sequence: string): ProteinPropertiesResult {
  const seq = sequence.toUpperCase();
  let mw = 18.02;
  const composition: Record<string, number> = {};
  let totalHydropathy = 0;
  let countHydropathy = 0;
  let numW = 0, numY = 0;
  let aromaticCount = 0;

  for (const aa of seq) {
    if (aa in AA_MASSES) {
      mw += AA_MASSES[aa];
      composition[aa] = (composition[aa] || 0) + 1;
    }
    if (aa in AA_HYDROPHOBICITY) {
      totalHydropathy += AA_HYDROPHOBICITY[aa];
      countHydropathy++;
    }

    if (aa === 'W') { numW++; aromaticCount++; }
    if (aa === 'Y') { numY++; aromaticCount++; }
    if (AA_AROMATIC.has(aa)) aromaticCount++;
  }

  const hydrophobicity = countHydropathy > 0 ? totalHydropathy / countHydropathy : 0;
  const aromaticity = seq.length > 0 ? aromaticCount / seq.length : 0;

  const extReduced = numW * (AA_EXTINCTION.W?.reduced || 5500) + numY * (AA_EXTINCTION.Y?.reduced || 1490);

  const pI = calculatePI(seq, composition);
  const charge = calculateCharge(seq, composition, 7.0);

  const instability = calculateInstabilityIndex(seq);

  return {
    molecularWeight: Math.round(mw * 100) / 100,
    isoelectricPoint: Math.round(pI * 100) / 100,
    aminoAcidComposition: composition,
    hydrophobicity: Math.round(hydrophobicity * 100) / 100,
    charge: Math.round(charge * 100) / 100,
    extinctionCoefficient: extReduced,
    instabilityIndex: Math.round(instability * 100) / 100,
    aromaticity: Math.round(aromaticity * 1000) / 1000,
  };
}

function calculatePI(seq: string, comp: Record<string, number>): number {
  for (let pH = 0; pH <= 140; pH++) {
    const charge = calculateCharge(seq, comp, pH / 10);
    if (charge <= 0) return pH / 10;
  }
  return 7.0;
}

function calculateCharge(seq: string, comp: Record<string, number>, pH: number): number {
  let charge = 0;

  charge += 1 / (1 + Math.pow(10, pH - 7.5));
  charge += -1 / (1 + Math.pow(10, 3.9 - pH));

  for (const [aa, count] of Object.entries(comp)) {
    const pKa = AA_PKA[aa];
    if (!pKa) continue;
    if (aa === 'D' || aa === 'E' || aa === 'C' || aa === 'Y') {
      charge += count * (-1 / (1 + Math.pow(10, pKa - pH)));
    } else if (aa === 'H' || aa === 'K' || aa === 'R') {
      charge += count * (1 / (1 + Math.pow(10, pH - pKa)));
    }
  }

  return charge;
}

function calculateInstabilityIndex(seq: string): number {
  const dipeptideWeights: Record<string, number> = {
    'WW': 1.0, 'WV': 0.5, 'WI': 0.5, 'WL': 0.5, 'WF': 0.5,
    'MM': 1.0, 'MH': 0.5, 'MQ': 0.5, 'ME': 0.5, 'MD': 0.5,
    'II': 1.0, 'IH': 0.5, 'IQ': 0.5, 'IE': 0.5, 'ID': 0.5,
  };

  let index = 0;
  for (let i = 0; i < seq.length - 1; i++) {
    const di = seq.slice(i, i + 2);
    index += dipeptideWeights[di] || 0;
  }

  const len = seq.length;
  return len > 0 ? (index * 10 / len) * 10 : 0;
}
