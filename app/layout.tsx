import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JollyJuniors — Toys & Baby Care',
  description: 'Montessori toys, baby care, and gift hampers in Pakistan.',
};

/**
 * Root layout for the Next.js App Router storefront.
 * suppressHydrationWarning on body: browser extensions (e.g. Grammarly) inject
 * attributes like data-gr-ext-installed that otherwise trigger false hydration errors.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#FFFDF8] text-[#334155] antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
