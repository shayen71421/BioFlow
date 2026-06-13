'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';
