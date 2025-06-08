interface ProductsHeaderProps {
  totalProducts: number;
  resultsCount: number;
}

export function ProductsHeader({
  totalProducts,
  resultsCount,
}: ProductsHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Showing {resultsCount} of {totalProducts} products
        </p>
      </div>
    </div>
  );
}
