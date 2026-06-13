export function reverseComplement(sequence: string): string {
  const comp: Record<string, string> = {
    A: 'T', T: 'A', G: 'C', C: 'G',
    a: 't', t: 'a', g: 'c', c: 'g',
    N: 'N', n: 'n',
  };
  return sequence
    .split('')
    .reverse()
    .map((b) => comp[b] || 'N')
    .join('');
}

export function complement(sequence: string): string {
  const comp: Record<string, string> = {
    A: 'T', T: 'A', G: 'C', C: 'G',
    a: 't', t: 'a', g: 'c', c: 'g',
    N: 'N', n: 'n',
  };
  return sequence
    .split('')
    .map((b) => comp[b] || 'N')
    .join('');
}
