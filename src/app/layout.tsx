import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BioFlow - Visual Bioinformatics Workflows',
  description:
    'Build visual bioinformatics pipelines, explore sequences, and export commands. No terminal required.',
  keywords: [
    'bioinformatics',
    'workflow',
    'visual',
    'DNA',
    'sequence analysis',
    'ORF finder',
    'GC content',
  ],
  openGraph: {
    title: 'BioFlow - Visual Bioinformatics Workflows',
    description: 'Build visual pipelines and explore biological sequences without the command line.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300D4AA' stroke-width='2'><path d='M12 2a8 8 0 0 0-8 8c0 4 8 12 8 12s8-8 8-12a8 8 0 0 0-8-8z'/><path d='M12 6a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z'/></svg>" />
      </head>
      <body className="min-h-full font-sans text-foreground bg-background">
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
