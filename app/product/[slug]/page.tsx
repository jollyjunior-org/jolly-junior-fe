import { Metadata } from 'next';
import ProductPageWrapper from '@/components/product/ProductPageWrapper';
import { fetchPublicProduct } from '@/services/product-service';
/**
 * Generate dynamic Open Graph metadata for social sharing.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchPublicProduct(slug);
    
    // We usually want the main image as the OG image
    const ogImage = product.images?.[0] || 'https://jollyjuniors.pk/default-og.jpg';
    
    return {
      title: `${product.name} | Premium Kids Toys & Baby Care in Pakistan`,
      description: product.description || `Buy ${product.name} online from Jolly Juniors Pakistan. Premium quality, best prices, and fast delivery for kids toys and baby care.`,
      keywords: [
        product.name,
        'Jolly Juniors Pakistan',
        product.categoryName || 'Kids Toys',
        'buy toys online Pakistan',
        'baby care essentials Pakistan',
        'premium baby products',
      ],
      openGraph: {
        title: product.name,
        description: product.description || `Buy ${product.name} from Jolly Juniors.`,
        url: `https://jollyjuniors.pk/product/${slug}`,
        siteName: 'Jolly Juniors',
        images: [
          {
            url: ogImage,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        locale: 'en_PK',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Buy ${product.name} from Jolly Juniors.`,
        images: [ogImage],
      },
      alternates: {
        canonical: `https://jollyjuniors.pk/product/${slug}`,
      },
      category: product.categoryName || 'Toys & Games',
      robots: { index: true, follow: true },
    };
  } catch (error) {
    return {
      title: 'Product | Jolly Juniors',
      description: 'Discover premium baby products on Jolly Juniors.',
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
    
    // Create rich JSON-LD structure for Google Shopping / SEO
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images?.[0] || 'https://jollyjuniors.pk/default-og.jpg',
      description: product.description || `Buy ${product.name} at JollyJuniors.pk`,
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: 'Jolly Juniors',
      },
      offers: {
        '@type': 'Offer',
        url: `https://jollyjuniors.pk/product/${slug}`,
        priceCurrency: 'PKR',
        price: product.price,
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Jolly Juniors Pakistan',
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
