'use client';

import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, label, id, options, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all',
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
