import { useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  onSearchSubmit?: () => void;
}

export default function SearchBar({
  className,
  onSearchSubmit,
}: SearchBarProps) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  // Sync initial value from URL on mount so the bar reflects an active search query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = new URLSearchParams(window.location.search).get('search');
    if (search) setSearchValue(search);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchValue.trim()) params.search = searchValue.trim();
    navigate({ to: '/products', search: params });
    onSearchSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <div className='relative flex w-full rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30 overflow-hidden transition-shadow'>
        <Search className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder='Search products...'
          className='border-0 rounded-xl pl-9 h-10 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60'
          autoComplete='off'
        />
        {searchValue && (
          <button
            type='button'
            onClick={() => setSearchValue('')}
            className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
          >
            <X size={14} />
            <span className='sr-only'>Clear search</span>
          </button>
        )}
      </div>
    </form>
  );
}

SearchBar.Icon = function SearchIcon() {
  return <Search className='h-5 w-5' />;
};
