import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://www.jollyjuniors.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'JollyJuniors | Premium Kids Toys & Baby Care in Pakistan',
  description:
    'Shop certified organic baby care, wooden Montessori toys, educational games, and luxury gift hampers in Pakistan at JollyJuniors. Fast delivery & premium quality guaranteed.',
  keywords: [
    'JollyJuniors',
    'Jolly Juniors',
    'kids toys Pakistan',
    'buy toys online Pakistan',
    'baby care essentials',
    'Montessori toys',
    'educational toys for kids',
    'baby gift hampers',
    'soft toys',
    'arts and crafts for kids',
  ],
  authors: [{ name: 'JollyJuniors', url: SITE_URL }],
  creator: 'JollyJuniors',
  publisher: 'JollyJuniors',
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: SITE_URL,
    title: 'JollyJuniors | Premium Kids Toys & Baby Care in Pakistan',
    description:
      'Shop certified organic baby care, wooden Montessori toys, educational games, and luxury gift hampers in Pakistan. Fast delivery and premium quality guaranteed.',
    siteName: 'JollyJuniors',
    images: [
      {
        url: `${SITE_URL}/og-banner.jpg`,
        secureUrl: `${SITE_URL}/og-banner.jpg`,
        width: 1200,
        height: 630,
        alt: 'JollyJuniors Premium Kids Toys & Baby Care Shop',
        type: 'image/jpeg',
      },
      {
        url: `${SITE_URL}/og-banner.png`,
        secureUrl: `${SITE_URL}/og-banner.png`,
        width: 1200,
        height: 630,
        alt: 'JollyJuniors Premium Kids Toys & Baby Care Shop',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JollyJuniors | Premium Kids Toys & Baby Care in Pakistan',
    description:
      'Shop certified organic baby care, wooden Montessori toys, educational games, and luxury gift hampers in Pakistan.',
    images: [`${SITE_URL}/og-banner.png`],
    creator: '@jollyjuniors',
  },
  facebook: {
    appId: '966846896263595',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
      <head>
        <meta property="og:image" content={`${SITE_URL}/og-banner.jpg`} />
        <meta property="og:image:url" content={`${SITE_URL}/og-banner.jpg`} />
        <meta property="og:image:secure_url" content={`${SITE_URL}/og-banner.jpg`} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="JollyJuniors Premium Kids Toys & Baby Care Shop" />
        <meta property="fb:app_id" content="966846896263595" />
      </head>
      <body
        className="min-h-screen bg-[#FFFDF8] text-[#334155] antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
