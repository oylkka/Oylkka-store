import { Link } from '@tanstack/react-router';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/services/cart';

export default function Cart() {
  const { data: cart } = useCart();
  const itemCount = cart?.items?.length ?? 0;

  return (
    <Link to='/cart'>
      <Button variant='outline' size='icon' className='relative'>
        <ShoppingCart className='h-[1.2rem] w-[1.2rem]' />
        {itemCount > 0 && (
          <span className='absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full min-w-[18px] min-h-[18px] px-1'>
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
        <span className='sr-only'>Shopping cart</span>
      </Button>
    </Link>
  );
}
