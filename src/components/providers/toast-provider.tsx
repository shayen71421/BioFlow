'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#111827',
          border: '1px solid #1E293B',
          color: '#F1F5F9',
        },
      }}
    />
  );
}
