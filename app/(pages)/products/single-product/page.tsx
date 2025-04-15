'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SingleProductContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  return <>Search: {productId}</>;
}

export default function SingleProduct() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SingleProductContent />
    </Suspense>
  );
}
