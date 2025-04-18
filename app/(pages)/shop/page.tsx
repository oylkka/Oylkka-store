'use client';

import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductList } from '@/service/product-list';

type Product = {
  id: string;
  productName: string;
  price: number; // original price
  discountPrice?: number | null; // optional
  discountPercent?: number | null;
  images: { url: string }[];
};

export default function ShopPage() {
  const { data: productsData, isLoading, error } = useProductList();
  const products: Product[] = productsData?.products || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={idx} className="h-[350px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-center text-lg text-red-500">
        Something went wrong while loading products.
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <p className="text-muted-foreground text-xl font-semibold">
          No products found.
        </p>
        <Button variant="outline">Back to Home</Button>
      </div>
    );
  }

  return (
    <section className="p-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Explore Products
      </h1>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const imageUrl = product.images?.[0]?.url;

          return (
            <Card
              key={product.id}
              className="group border-muted bg-background/70 relative overflow-hidden rounded-2xl border shadow-md backdrop-blur-md transition-transform hover:scale-[1.015]"
            >
              {/* Discount Badge */}
              {product.discountPercent ? (
                <div className="absolute top-3 left-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow">
                  {product.discountPercent}% OFF
                </div>
              ) : null}

              {/* Product Image */}
              <div className="relative h-64 w-full overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.productName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* Content */}
              <CardContent className="space-y-1 p-4">
                <h3 className="text-foreground truncate text-lg font-medium">
                  {product.productName}
                </h3>
                <div className="flex items-center gap-2">
                  {product.discountPrice ? (
                    <>
                      <span className="text-primary text-base font-semibold">
                        ${product.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground text-sm line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-primary text-base font-semibold">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between p-4 pt-2">
                <Badge variant="outline">
                  {product.discountPrice ? 'On Sale' : 'In Stock'}
                </Badge>
                <Button variant="secondary" size="sm">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
