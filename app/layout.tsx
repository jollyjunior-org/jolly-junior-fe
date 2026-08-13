import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JollyJuniors | Premium Kids Toys & Baby Care in Pakistan',
  description: 'Shop the best Montessori toys, educational games, baby care essentials, and gift hampers for children in Pakistan. Fast delivery and premium quality at JollyJuniors.',
  keywords: [
    'JollyJuniors', 'Jolly Juniors', 'kids toys Pakistan', 'buy toys online Pakistan', 
    'baby care essentials', 'Montessori toys', 'educational toys for kids', 
    'children clothing Pakistan', 'baby gift hampers', 'soft toys', 'arts and crafts for kids'
  ],
  authors: [{ name: 'JollyJuniors' }],
  creator: 'JollyJuniors',
  publisher: 'JollyJuniors',
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://jollyjuniors.pk',
    title: 'JollyJuniors | Premium Kids Toys & Baby Care',
    description: 'Shop the best Montessori toys, educational games, and baby care essentials in Pakistan. Fast delivery and premium quality.',
    siteName: 'JollyJuniors',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JollyJuniors | Premium Kids Toys & Baby Care',
    description: 'Shop the best Montessori toys, educational games, and baby care essentials in Pakistan.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
  },
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
