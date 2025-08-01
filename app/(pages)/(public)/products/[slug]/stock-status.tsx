import { Badge } from '@/components/ui/badge';

interface StockStatusProps {
  stock: number;
  lowStockThreshold?: number;
}

export const StockStatus = ({
  stock,
  lowStockThreshold = 10,
}: StockStatusProps) => {
  if (stock <= 0) {
    return <Badge variant='destructive'>Out of Stock</Badge>;
  }

  if (stock <= lowStockThreshold) {
    return (
      <Badge variant='outline' className='border-amber-500 text-amber-500'>
        Low Stock: {stock} left
      </Badge>
    );
  }

  return (
    <Badge variant='outline' className='border-emerald-500 text-emerald-500'>
      In Stock
    </Badge>
  );
};
