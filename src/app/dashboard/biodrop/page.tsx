'use client';

import { useState } from 'react';
import { DropZone } from '@/components/biodrop/drop-zone';
import { SequenceViewer } from '@/components/biodrop/sequence-viewer';
import { OrfDisplay } from '@/components/biodrop/orf-display';
import { TranslationView } from '@/components/biodrop/translation-view';
import { GcChart } from '@/components/biodrop/gc-chart';
import { ReverseComplementView } from '@/components/biodrop/reverse-complement';
import { SequenceStats } from '@/components/biodrop/sequence-stats';
import { CodonTableView } from '@/components/biodrop/codon-table';
import { ExportOptions } from '@/components/biodrop/export-options';
import { Tabs } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSequenceStore } from '@/store/sequence-store';

const tabs = [
  { id: 'viewer', label: 'Sequence' },
  { id: 'orfs', label: 'ORF Finder' },
  { id: 'translation', label: 'Translation' },
  { id: 'gc', label: 'GC Content' },
  { id: 'revcomp', label: 'Reverse Comp' },
  { id: 'stats', label: 'Statistics' },
  { id: 'codon', label: 'Codon Table' },
  { id: 'export', label: 'Export' },
];

export default function BioDropPage() {
  const [activeTab, setActiveTab] = useState('viewer');
  const sequences = useSequenceStore((s) => s.sequences);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-border bg-background">
        <div className="px-4 pt-3 pb-0">
          <h1 className="text-sm font-semibold text-foreground mb-3">BioDrop Explorer</h1>
          <DropZone />
        </div>
        {sequences.length > 0 && (
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-4 mt-3" />
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {sequences.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-muted-foreground text-sm">Drop a FASTA file or load a demo to begin</div>
            <p className="text-xs text-muted-foreground mt-1">
              Supported: .fasta, .fa, .fna
            </p>
          </div>
        ) : (
          <div>
            {activeTab === 'viewer' && <SequenceViewer />}
            {activeTab === 'orfs' && <OrfDisplay />}
            {activeTab === 'translation' && <TranslationView />}
            {activeTab === 'gc' && <GcChart />}
            {activeTab === 'revcomp' && <ReverseComplementView />}
            {activeTab === 'stats' && <SequenceStats />}
            {activeTab === 'codon' && <CodonTableView />}
            {activeTab === 'export' && <ExportOptions />}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
