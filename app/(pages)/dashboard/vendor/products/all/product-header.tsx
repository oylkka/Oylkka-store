'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';

interface FilterState {
  category: string;
  sortBy: string;
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: string[];
}

const COLOR_OPTIONS = [
  { value: 'black', color: '#000000', label: 'Black' },
  { value: 'red', color: '#ff0000', label: 'Red' },
  { value: 'green', color: '#00ff00', label: 'Green' },
  { value: 'blue', color: '#0000ff', label: 'Blue' },
  { value: 'white', color: '#ffffff', label: 'White' },
  { value: 'orange', color: '#ffa500', label: 'Orange' },
];

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductHeader({
  totalProducts,
}: {
  totalProducts: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || '',
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  // Initialize filter state from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    const sizes = searchParams.get('sizes')?.split(',') || [];
    const colors = searchParams.get('colors')?.split(',') || [];

    return {
      category: searchParams.get('category') || 'All',
      sortBy: searchParams.get('sortBy') || '',
      minPrice: Number(searchParams.get('minPrice')) || 0,
      maxPrice: Number(searchParams.get('maxPrice')) || 10000,
      sizes: sizes.filter(Boolean),
      colors: colors.filter(Boolean),
    };
  });

  // Debounce the search input
  const [debouncedSearch] = useDebounce(searchInput, 500);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | string[]>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value &&
          value !== 'All' &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','));
          } else {
            params.set(key, value);
          }
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      params.delete('page');

      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  // Update URL when debounced search changes
  useEffect(() => {
    updateSearchParams({ search: debouncedSearch });
  }, [debouncedSearch, updateSearchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission will trigger the debounced update
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const handlePriceRangeChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 0;
    setFilters((prev) => ({ ...prev, minPrice: value }));
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 1000;
    setFilters((prev) => ({ ...prev, maxPrice: value }));
  };

  const handleSizeToggle = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleColorToggle = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleApplyFilters = () => {
    updateSearchParams({
      category: filters.category,
      sortBy: filters.sortBy,
      minPrice: filters.minPrice.toString(),
      maxPrice: filters.maxPrice.toString(),
      sizes: filters.sizes,
      colors: filters.colors,
    });
    setSheetOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: 'All',
      sortBy: '',
      minPrice: 0,
      maxPrice: 1000,
      sizes: [],
      colors: [],
    };
    setFilters(resetFilters);

    // Clear all filter params from URL
    const params = new URLSearchParams(searchParams.toString());
    ['category', 'sortBy', 'minPrice', 'maxPrice', 'sizes', 'colors'].forEach(
      (key) => {
        params.delete(key);
      },
    );
    params.delete('page');
    router.push(`?${params.toString()}`);
    setSheetOpen(false);
  };

  return (
    <section className='mb-12 px-4 md:px-0'>
      <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        {/* Heading */}
        <div>
          <h1 className='text-foreground text-4xl font-bold tracking-tight'>
            Your Products
          </h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            total - {totalProducts} products
          </p>
        </div>

        {/* Search and Filter Row */}
        <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto'>
          <div className='flex w-full gap-2 sm:w-auto'>
            {/* Search */}
            <form
              className='relative w-full md:w-[300px] lg:w-[400px]'
              onSubmit={handleSearchSubmit}
            >
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                type='text'
                placeholder='Search products...'
                className='pl-9'
                value={searchInput}
                onChange={handleSearchChange}
              />
            </form>

            {/* Filter Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button className='min-w-fit gap-2'>
                  <SlidersHorizontal className='h-4 w-4' />
                  <span className='hidden sm:inline'>Filter</span>
                </Button>
              </SheetTrigger>

              <SheetContent className='w-full px-6 py-6 sm:max-w-md'>
                <SheetHeader className='mb-4'>
                  <SheetTitle className='text-xl'>Filters</SheetTitle>
                  <SheetDescription>
                    Narrow down your product selection
                  </SheetDescription>
                </SheetHeader>

                <ScrollArea className='h-[calc(100vh-15rem)] pr-2'>
                  <div className='space-y-8'>
                    {/* Category */}
                    <div>
                      <h3 className='mb-3 text-base font-medium'>Categories</h3>
                      <div className='flex flex-wrap gap-2'>
                        {['All', 'Clothing', 'T-Shirt', 'Accessories'].map(
                          (cat) => (
                            <Button
                              key={cat}
                              variant={
                                filters.category === cat ? 'default' : 'outline'
                              }
                              className='rounded-full text-sm'
                              onClick={() => handleCategoryChange(cat)}
                            >
                              {cat}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Sort */}
                    <div>
                      <h3 className='mb-3 text-base font-medium'>Sort by</h3>
                      <Select
                        value={filters.sortBy}
                        onValueChange={handleSortChange}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select sorting' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='default'>Default</SelectItem>
                          <SelectItem value='popular'>Popular</SelectItem>
                          <SelectItem value='new'>Newest</SelectItem>
                          <SelectItem value='old'>Oldest</SelectItem>
                          <SelectItem value='priceLow'>
                            Price: Low to High
                          </SelectItem>
                          <SelectItem value='priceHigh'>
                            Price: High to Low
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Price Range */}
                    <div>
                      <h3 className='mb-3 text-base font-medium'>
                        Price Range
                      </h3>
                      <Slider
                        max={10000}
                        step={20}
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={handlePriceRangeChange}
                        className='mb-4'
                      />
                      <div className='flex gap-4'>
                        <Input
                          placeholder='৳ Min'
                          className='w-full'
                          type='number'
                          value={filters.minPrice || ''}
                          onChange={handleMinPriceChange}
                        />
                        <Input
                          placeholder='৳ Max'
                          className='w-full'
                          type='number'
                          value={filters.maxPrice || ''}
                          onChange={handleMaxPriceChange}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Sizes */}
                    <div>
                      <h3 className='mb-3 text-base font-medium'>Sizes</h3>
                      <div className='grid grid-cols-3 gap-3'>
                        {SIZE_OPTIONS.map((size) => (
                          <Button
                            key={size}
                            variant={
                              filters.sizes.includes(size)
                                ? 'default'
                                : 'outline'
                            }
                            className='w-full'
                            onClick={() => handleSizeToggle(size)}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Colors */}
                    <div>
                      <h3 className='mb-3 text-base font-medium'>Colors</h3>
                      <div className='flex flex-wrap gap-3'>
                        {COLOR_OPTIONS.map((colorOption) => (
                          <button
                            type='button'
                            key={colorOption.value}
                            style={{ backgroundColor: colorOption.color }}
                            className={`h-8 w-8 rounded-full border-2 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                              filters.colors.includes(colorOption.value)
                                ? 'border-blue-500 ring-2 ring-blue-300'
                                : 'border-gray-300'
                            }`}
                            onClick={() => handleColorToggle(colorOption.value)}
                            aria-label={`Color ${colorOption.label}`}
                            title={colorOption.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <SheetFooter className='flex flex-col gap-3 sm:flex-row sm:justify-between'>
                  <Button
                    variant='outline'
                    className='w-full sm:w-auto'
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                  <Button
                    className='w-full sm:w-auto'
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductHeaderSkeleton() {
  return (
    <section className='px-4 md:px-0'>
      <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
        {/* Heading Skeleton */}
        <div className='space-y-2'>
          <Skeleton className='h-10 w-48' />
          <Skeleton className='h-4 w-64' />
        </div>

        {/* Search and Filter Skeleton */}
        <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto'>
          <div className='flex w-full gap-2 sm:w-auto'>
            <Skeleton className='h-10 w-full md:w-[300px] lg:w-[400px]' />
            <Skeleton className='h-10 w-24' />
          </div>
        </div>
      </div>
    </section>
  );
}
