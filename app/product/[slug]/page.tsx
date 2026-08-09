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
      title: `${product.name} | Jolly Juniors`,
      description: product.description || `Buy ${product.name} from Jolly Juniors.`,
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
export default function ProductPage() {
  return <ProductPageWrapper />;
}
