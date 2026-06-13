import type { GenBankFeature, GenBankResult } from '@/types/sequence';

export function parseGenBank(text: string): GenBankResult {
  const result: GenBankResult = {
    accession: '',
    version: '',
    organism: '',
    definition: '',
    sequence: '',
    length: 0,
    features: [],
    cds: [],
    annotations: {},
  };

  const lines = text.split('\n');
  let inFeatures = false;
  let inSequence = false;
  let currentFeature: Partial<GenBankFeature> | null = null;
  const seqParts: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const key = line.slice(0, 12).trim();
    const value = line.slice(12);

    if (key === 'LOCUS') {
      const parts = value.split(/\s+/);
      result.accession = parts[0] || '';
      const bpIdx = value.indexOf('bp');
      if (bpIdx > 0) {
        const numStr = value.slice(0, bpIdx).trim().split(/\s+/).pop() || '0';
        result.length = parseInt(numStr, 10) || 0;
      }
    }

    if (key === 'VERSION') {
      result.version = value.trim().split(/\s/)[0];
    }

    if (key === 'DEFINITION') {
      result.definition += value.trim() + ' ';
    }

    if (key === 'ACCESSION') {
      if (!result.accession) result.accession = value.trim().split(/\s/)[0];
    }

    if (key === 'ORGANISM') {
      result.organism = value.trim();
    }

    if (key === 'FEATURES') {
      inFeatures = true;
      continue;
    }

    if (key === 'ORIGIN') {
      inFeatures = false;
      inSequence = true;
      continue;
    }

    if (inFeatures) {
      if (line.startsWith(' ')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('/')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const qKey = trimmed.slice(1, eqIdx);
            const qVal = trimmed.slice(eqIdx + 1).replace(/^"|"$/g, '');
            if (currentFeature) {
              currentFeature.qualifiers = currentFeature.qualifiers || {};
              currentFeature.qualifiers[qKey] = currentFeature.qualifiers[qKey] || [];
              currentFeature.qualifiers[qKey].push(qVal);
            }
          }
        } else if (currentFeature && /^\d+/.test(trimmed)) {
          const pos = parseLocation(trimmed);
          if (pos) {
            currentFeature.start = pos.start;
            currentFeature.end = pos.end;
            currentFeature.strand = pos.strand;
          }
        }
      } else if (currentFeature && currentFeature.type) {
        result.features.push(currentFeature as GenBankFeature);
        if (currentFeature.type === 'CDS') {
          result.cds.push(currentFeature as GenBankFeature);
        }
        currentFeature = null;
      }

      if (!line.startsWith(' ') && line.trim() && key) {
        if (currentFeature && currentFeature.type) {
          result.features.push(currentFeature as GenBankFeature);
          if (currentFeature.type === 'CDS') {
            result.cds.push(currentFeature as GenBankFeature);
          }
        }
        if (!/^\s+/.test(line) && !/^[A-Z]/.test(line.trim())) {
          currentFeature = { type: line.trim(), qualifiers: {} };
        } else if (key && !key.includes(' ')) {
          const locStr = line.slice(5).trim();
          if (/^\d/.test(locStr)) {
            const pos = parseLocation(locStr);
            if (pos) {
              currentFeature = { type: key, start: pos.start, end: pos.end, strand: pos.strand, qualifiers: {} };
            }
          }
        }
      }
    }

    if (inSequence && !line.startsWith('ORIGIN') && !line.startsWith('//')) {
      const seqLine = line.slice(10).replace(/\s/g, '').toUpperCase();
      if (seqLine) seqParts.push(seqLine);
    }
  }

  if (currentFeature && currentFeature.type) {
    result.features.push(currentFeature as GenBankFeature);
    if (currentFeature.type === 'CDS') {
      result.cds.push(currentFeature as GenBankFeature);
    }
  }

  result.sequence = seqParts.join('');
  result.definition = result.definition.trim();

  return result;
}

function parseLocation(loc: string): { start: number; end: number; strand: '+' | '-' | '.' } | null {
  const match = loc.match(/(\d+)\.\.(\d+)/);
  if (match) {
    return { start: parseInt(match[1]), end: parseInt(match[2]), strand: '+' };
  }
  const compMatch = loc.match(/complement\((\d+)\.\.(\d+)\)/);
  if (compMatch) {
    return { start: parseInt(compMatch[1]), end: parseInt(compMatch[2]), strand: '-' };
  }
  return null;
}
