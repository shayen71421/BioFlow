'use client';

import { Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { useSequenceStore } from '@/store/sequence-store';
import { formatFasta } from '@/lib/bio/fasta-parser';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ExportOptions() {
  const sequences = useSequenceStore((s) => s.sequences);
  const orfs = useSequenceStore((s) => s.orfs);
  const gcResult = useSequenceStore((s) => s.gcResult);
  const stats = useSequenceStore((s) => s.stats);

  const handleExportCSV = () => {
    if (!stats) return;
    const rows = [
      ['Metric', 'Value'],
      ['Length', stats.length.toString()],
      ['GC%', stats.gcPercent.toFixed(2)],
      ['AT%', stats.atPercent.toFixed(2)],
      ['ORFs', stats.orfCount.toString()],
      ['A', stats.nucleotides.A.toString()],
      ['T', stats.nucleotides.T.toString()],
      ['G', stats.nucleotides.G.toString()],
      ['C', stats.nucleotides.C.toString()],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    download(csv, 'sequence-stats.csv', 'text/csv');
    toast.success('CSV exported');
  };

  const handleExportJSON = () => {
    const data = {
      sequences,
      orfs,
      gcContent: gcResult,
      stats,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    download(json, 'bioflow-export.json', 'application/json');
    toast.success('JSON exported');
  };

  const handleExportFASTA = () => {
    if (sequences.length === 0) return;
    const fasta = formatFasta(sequences);
    download(fasta, 'sequences.fasta', 'text/plain');
    toast.success('FASTA exported');
  };

  const handleExportReport = () => {
    if (!stats || !gcResult) return;
    const report = [
      '# BioFlow Analysis Report',
      '',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## Sequence Information',
      `- Header: ${sequences[0]?.header || 'N/A'}`,
      `- Length: ${stats.length.toLocaleString()} bp`,
      '',
      '## Base Composition',
      `- GC Content: ${stats.gcPercent.toFixed(1)}%`,
      `- AT Content: ${stats.atPercent.toFixed(1)}%`,
      `- A: ${stats.nucleotides.A.toLocaleString()}`,
      `- T: ${stats.nucleotides.T.toLocaleString()}`,
      `- G: ${stats.nucleotides.G.toLocaleString()}`,
      `- C: ${stats.nucleotides.C.toLocaleString()}`,
      '',
      '## ORF Analysis',
      `- ORFs found: ${orfs.length}`,
      '',
      '## GC Distribution',
      `- Overall GC: ${gcResult.overall.toFixed(1)}%`,
      `- Overall AT: ${gcResult.at.toFixed(1)}%`,
    ].join('\n');
    download(report, 'bioflow-report.md', 'text/markdown');
    toast.success('Report exported');
  };

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground mb-2">Export Options</div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="justify-start">
          <FileSpreadsheet size={14} /> CSV
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportJSON} className="justify-start">
          <FileJson size={14} /> JSON
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportFASTA} className="justify-start">
          <Download size={14} /> FASTA
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportReport} className="justify-start">
          <FileText size={14} /> Report
        </Button>
      </div>
    </div>
  );
}
