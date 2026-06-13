'use client';

import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSequenceStore } from '@/store/sequence-store';
import { Card } from '@/components/ui/card';

export function GcChart() {
  const gcResult = useSequenceStore((s) => s.gcResult);

  if (!gcResult) {
    return <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No GC data</div>;
  }

  const formatTooltip = (value: unknown) => [`${Number(value).toFixed(1)}%`, 'GC'] as [string, string];
  const formatLabel = (v: unknown) => `Position: ${Number(v).toLocaleString()}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">GC Content</div>
          <div className="text-lg font-bold text-success font-mono">
            {gcResult.overall.toFixed(1)}%
          </div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">AT Content</div>
          <div className="text-lg font-bold text-warning font-mono">
            {gcResult.at.toFixed(1)}%
          </div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-muted-foreground mb-1">Total Bases</div>
          <div className="text-lg font-bold text-foreground font-mono">
            {gcResult.total.toLocaleString()}
          </div>
        </Card>
      </div>

      <div>
        <div className="text-sm font-medium text-foreground mb-3">GC Distribution</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gcResult.distribution}>
              <defs>
                <linearGradient id="gcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4AA" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00D4AA" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="atGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="#64748B"
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#64748B"
                tick={{ fill: '#64748B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <RechartsTooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid #1E293B',
                  borderRadius: '8px',
                  color: '#F1F5F9',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="gc"
                stroke="#00D4AA"
                fill="url(#gcGrad)"
                strokeWidth={2}
                name="GC%"
              />
              <Area
                type="monotone"
                dataKey="at"
                stroke="#F59E0B"
                fill="url(#atGrad)"
                strokeWidth={2}
                name="AT%"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {gcResult.windowData.length > 0 && (
        <div>
          <div className="text-sm font-medium text-foreground mb-3">
            Sliding Window GC (window: 100bp)
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gcResult.windowData}>
                <defs>
                  <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="position"
                  stroke="#64748B"
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}kb`}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid #1E293B',
                    borderRadius: '8px',
                    color: '#F1F5F9',
                    fontSize: '12px',
                  }}
                  formatter={formatTooltip}
                  labelFormatter={formatLabel}
                />
                <Area
                  type="monotone"
                  dataKey="gc"
                  stroke="#8B5CF6"
                  fill="url(#windowGrad)"
                  strokeWidth={2}
                  name="GC%"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
