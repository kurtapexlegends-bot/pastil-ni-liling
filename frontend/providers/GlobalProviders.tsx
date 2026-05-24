'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { ConfirmProvider } from '../hooks/useConfirm';

export default function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <Toaster 
        position="top-right" 
        richColors 
        toastOptions={{
          style: {
            borderRadius: '16px',
            padding: '16px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }
        }} 
      />
      {children}
    </ConfirmProvider>
  );
}
