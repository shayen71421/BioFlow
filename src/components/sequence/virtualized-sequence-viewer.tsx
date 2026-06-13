'use client';

import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedSequenceViewerProps {
  sequence: string;
  highlights?: { start: number; end: number; color: string; label?: string }[];
  chunkSize?: number;
  rowHeight?: number;
  visibleRows?: number;
  className?: string;
}

const BASE_COLORS: Record<string, string> = {
  A: 'text-[#22C55E]',
  T: 'text-[#EF4444]',
  G: 'text-[#F59E0B]',
  C: 'text-[#3B82F6]',
  N: 'text-muted-foreground',
};

export function VirtualizedSequenceViewer({
  sequence,
  highlights = [],
  chunkSize = 100,
  rowHeight = 22,
  visibleRows = 30,
  className,
}: VirtualizedSequenceViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(visibleRows * rowHeight);

  const totalChars = sequence.length;
  const totalRows = Math.ceil(totalChars / chunkSize);
  const totalHeight = totalRows * rowHeight;

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const endRow = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + 2);

  const visibleRowsData = useMemo(() => {
    const rows: { index: number; offset: number; text: string }[] = [];
    for (let row = startRow; row < endRow; row++) {
      const offset = row * chunkSize;
      const text = sequence.slice(offset, offset + chunkSize);
      rows.push({ index: row, offset, text });
    }
    return rows;
  }, [sequence, startRow, endRow, chunkSize]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, { color: string; label?: string }>();
    for (const h of highlights) {
      for (let i = h.start; i < h.end && i < totalChars; i++) {
        map.set(i, { color: h.color, label: h.label });
      }
    }
    return map;
  }, [highlights, totalChars]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto font-mono text-xs leading-none', className)}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleRowsData.map((row) => (
          <div
            key={row.index}
            className="flex items-center px-2 hover:bg-surface-hover/30"
            style={{ position: 'absolute', top: row.index * rowHeight, height: rowHeight, width: '100%' }}
          >
            <span className="text-[10px] text-muted-foreground w-[60px] shrink-0 select-none">
              {row.offset.toLocaleString()}
            </span>
            <div className="flex items-center gap-[1px]">
              {row.text.split('').map((base, ci) => {
                const charIdx = row.offset + ci;
                const hl = highlightMap.get(charIdx);
                const baseColor = BASE_COLORS[base] || 'text-muted-foreground';
                return (
                  <span
                    key={ci}
                    className={cn(
                      baseColor,
                      hl && 'rounded-sm px-[0.5px]',
                    )}
                    style={hl ? { backgroundColor: hl.color + '30' } : undefined}
                    title={hl?.label ? `${hl.label} at ${charIdx}` : undefined}
                  >
                    {base}
                  </span>
                );
              })}
            </div>
            <span className="text-[10px] text-muted-foreground ml-2 shrink-0 select-none">
              {Math.min(row.offset + chunkSize, totalChars).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
