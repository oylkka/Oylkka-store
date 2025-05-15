'use client';

import { useFeaturedProducts } from '@/services/public/featured-products';

export default function FeaturedProducts() {
  const { isPending, data, isError } = useFeaturedProducts();
  return <div>FeaturedProducts</div>;
}
