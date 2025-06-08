import { Download, Plus, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';

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

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
}
