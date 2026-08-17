import { Metadata } from 'next';
import ProductPageWrapper from '@/components/product/ProductPageWrapper';
import { fetchPublicProduct } from '@/services/product-service';

const SITE_URL = 'https://www.jollyjuniors.com';

/** Format & optimize image URLs specifically for WhatsApp, Instagram, and social crawlers. */
function getOptimizedOgImage(imageUrl?: string | null): string {
  if (!imageUrl) return `${SITE_URL}/og-banner.png`;
  
  if (imageUrl.includes('res.cloudinary.com')) {
    if (!imageUrl.includes('/c_') && !imageUrl.includes('/w_')) {
      return imageUrl.replace('/upload/', '/upload/c_pad,w_800,h_800,b_white,f_jpg,q_auto/');
    }
  }
  return imageUrl;
}

/**
 * Generate dynamic Open Graph metadata for social sharing.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const productUrl = `${SITE_URL}/product/${slug}`;

  try {
    const product = await fetchPublicProduct(slug);
    const mainImg = product.images?.[0] || null;
    const ogImageUrl = getOptimizedOgImage(mainImg);

    const priceText = product.price ? `Rs. ${product.price.toLocaleString()}` : '';
    const categoryText = product.categoryName ? ` · ${product.categoryName}` : '';
    const cleanDescription = product.description
      ? product.description.slice(0, 160)
      : `Buy ${product.name} online from JollyJuniors Pakistan. ${priceText}${categoryText}. Fast delivery and premium quality guaranteed.`;

    const title = `${product.name} ${priceText ? `(${priceText})` : ''} | JollyJuniors Pakistan`;

    return {
      metadataBase: new URL(SITE_URL),
      title,
      description: cleanDescription,
      keywords: [
        product.name,
        'JollyJuniors Pakistan',
        product.categoryName || 'Kids Toys',
        'buy toys online Pakistan',
        'baby care essentials Pakistan',
      ],
      openGraph: {
        title,
        description: cleanDescription,
        url: productUrl,
        siteName: 'JollyJuniors',
        images: [
          {
            url: ogImageUrl,
            secureUrl: ogImageUrl,
            width: 800,
            height: 800,
            alt: product.name,
            type: 'image/jpeg',
          },
        ],
        locale: 'en_PK',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: cleanDescription,
        images: [ogImageUrl],
        creator: '@jollyjuniors',
      },
      alternates: {
        canonical: productUrl,
      },
      category: product.categoryName || 'Toys & Games',
      robots: { index: true, follow: true },
    };
  } catch (error) {
    return {
      metadataBase: new URL(SITE_URL),
      title: 'Product | JollyJuniors Pakistan',
      description: 'Discover premium kids toys and baby care essentials on JollyJuniors Pakistan.',
      openGraph: {
        title: 'JollyJuniors | Premium Kids Toys & Baby Care',
        description: 'Discover premium kids toys and baby care essentials on JollyJuniors Pakistan.',
        url: productUrl,
        siteName: 'JollyJuniors',
        images: [
          {
            url: `${SITE_URL}/og-banner.png`,
            secureUrl: `${SITE_URL}/og-banner.png`,
            width: 1200,
            height: 630,
            alt: 'JollyJuniors',
            type: 'image/png',
          },
        ],
      },
    };
  }
}

/**
 * Shareable product URL: /product/[slug]
 * Example: /product/wooden-sorting-tower
 */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let productJsonLd = null;

  try {
    const product = await fetchPublicProduct(slug);
    const ogImageUrl = getOptimizedOgImage(product.images?.[0]);
    
    // Create rich JSON-LD structure for Google Shopping / SEO
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: [ogImageUrl, ...(product.images || [])],
      description: product.description || `Buy ${product.name} at JollyJuniors.com`,
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: 'JollyJuniors',
      },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/product/${slug}`,
        priceCurrency: 'PKR',
        price: product.price,
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'JollyJuniors Pakistan',
          url: SITE_URL,
        },
      },
    };
    
    productJsonLd = jsonLd;
  } catch (err) {
    // ignore
  }

  return (
    <>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      <ProductPageWrapper />
    </>
  );
}
