import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { fetchPublicProduct } from '@/services/product-service';

const ProductPageClient = dynamic(() => import('@/components/product/ProductPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center text-[#8C8C70] text-sm font-medium">
      Loading product…
    </div>
  ),
});

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
  return <ProductPageClient />;
}
