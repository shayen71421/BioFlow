import type { ORF } from '@/types/sequence';

export function validateORF(orf: ORF): string[] {
  const errors: string[] = [];

  if (orf.start < 0) errors.push(`start (${orf.start}) must be >= 0`);
  if (orf.end <= orf.start) errors.push(`end (${orf.end}) must be > start (${orf.start})`);
  if (orf.lengthBp !== orf.end - orf.start) errors.push(`lengthBp (${orf.lengthBp}) must equal end - start (${orf.end - orf.start})`);
  if (orf.lengthAa !== Math.floor(orf.lengthBp / 3)) errors.push(`lengthAa (${orf.lengthAa}) must equal floor(lengthBp / 3) = ${Math.floor(orf.lengthBp / 3)}`);
  if (orf.lengthBp % 3 !== 0) errors.push(`lengthBp (${orf.lengthBp}) must be divisible by 3`);
  if (orf.protein.length !== orf.lengthAa) errors.push(`protein length (${orf.protein.length}) must equal lengthAa (${orf.lengthAa})`);
  if (orf.frame < 0 || orf.frame > 5) errors.push(`frame (${orf.frame}) must be 0-5`);

  return errors;
}

export function validateORFList(orfs: ORF[]): string[] {
  const errors: string[] = [];

  for (let i = 0; i < orfs.length; i++) {
    const orfErrors = validateORF(orfs[i]);
    for (const e of orfErrors) errors.push(`ORF[${i}]: ${e}`);
  }

  const positions = new Set<string>();
  for (const orf of orfs) {
    const key = `${orf.start}-${orf.end}-${orf.frame}`;
    if (positions.has(key)) errors.push(`Duplicate ORF: start=${orf.start}, end=${orf.end}, frame=${orf.frame}`);
    positions.add(key);
  }

  return errors;
}
