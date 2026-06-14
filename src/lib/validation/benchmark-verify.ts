import BENCHMARK_SEQUENCES from './benchmark-data';

interface VerifyResult {
  id: string;
  name: string;
  field: string;
  expected: string;
  actual: string;
  ok: boolean;
}

function verifySequenceLength(seq: string, expectedLen: number, id: string, name: string): VerifyResult {
  const actual = seq.length;
  return {
    id,
    name,
    field: 'sequence length',
    expected: `${expectedLen}`,
    actual: `${actual}`,
    ok: actual === expectedLen,
  };
}

function verifyGC(gcCount: number, seq: string, id: string, name: string): VerifyResult {
  let computed = 0;
  for (const b of seq.toUpperCase()) {
    if (b === 'G' || b === 'C') computed++;
  }
  return {
    id,
    name,
    field: `GC count (expected ${gcCount})`,
    expected: `${gcCount}`,
    actual: `${computed}`,
    ok: computed === gcCount,
  };
}

function verifyExpectedMatchesInput(testCase: typeof BENCHMARK_SEQUENCES[0]): VerifyResult[] {
  const results: VerifyResult[] = [];
  const { id, name, input, expected, category } = testCase;

  // Verify sequence lengths in GC Content tests
  if (category === 'GC Content' && input['sequence']) {
    const seq = input['sequence'];
    if ('total' in expected) {
      results.push(verifySequenceLength(seq, expected.total as number, id, name));
    }
    if ('gcCount' in expected) {
      results.push(verifyGC(expected.gcCount as number, seq, id, name));
    }
  }

  // Verify ORF input sequence length sanity
  if (category === 'ORF Finder' && input['sequence']) {
    const seq = input['sequence'];
    if ('firstStart' in expected && 'firstEnd' in expected) {
      const end = expected.firstEnd as number;
      if (end > seq.length) {
        results.push({
          id, name,
          field: 'ORF end within sequence',
          expected: `end (${end}) <= seq.length (${seq.length})`,
          actual: `${end} > ${seq.length}`,
          ok: false,
        });
      }
    }
  }

  // Verify motif is actually present in sequence
  if (category === 'Motif Search' && input['motif'] && input['sequence']) {
    const seq = input['sequence'].toUpperCase();
    const motif = input['motif'].toUpperCase();
    if ('totalMatches' in expected && (expected.totalMatches as number) > 0) {
      const re = new RegExp(motif, 'g');
      const matches = seq.match(re);
      const count = matches ? matches.length : 0;
      if (count !== (expected.totalMatches as number)) {
        results.push({
          id, name,
          field: 'motif count in sequence',
          expected: `${expected.totalMatches}`,
          actual: `${count}`,
          ok: false,
        });
      }
    }
  }

  // Verify translation expected frame length
  if (category === 'Translation' && input['sequence'] && input['frames']) {
    const seq = input['sequence'];
    if ('frame0' in expected) {
      const expectedAas = expected.frame0 as string;
      const expectedCodons = expectedAas.length;
      const maxCodons = Math.floor(seq.length / 3);
      if (expectedCodons > maxCodons) {
        results.push({
          id, name,
          field: 'translation length ≤ sequence/3',
          expected: `≤ ${maxCodons}`,
          actual: `${expectedCodons}`,
          ok: false,
        });
      }
    }
  }

  // Verify reverse complement is correct length
  if (category === 'Reverse Complement' && input['sequence'] && 'reverseComplement' in expected) {
    const seq = input['sequence'];
    const expectedRC = expected.reverseComplement as string;
    if (expectedRC.length !== seq.length) {
      results.push({
        id, name,
        field: 'revcomp length == input length',
        expected: `${seq.length}`,
        actual: `${expectedRC.length}`,
        ok: false,
      });
    }
  }

  return results;
}

export function verifyBenchmarkMetadata(): { passed: number; failed: number; results: VerifyResult[] } {
  const allResults: VerifyResult[] = [];

  for (const tc of BENCHMARK_SEQUENCES) {
    const checks = verifyExpectedMatchesInput(tc);
    allResults.push(...checks);
  }

  const passed = allResults.filter((r) => r.ok).length;
  const failed = allResults.filter((r) => !r.ok).length;

  return { passed, failed, results: allResults };
}
