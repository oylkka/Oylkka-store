'use client';

import clsx from 'clsx';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { useFilterParams } from '@/hooks/use-filter-params';

export default function ProductHeader() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 500]);
  const [minPrice, setMinPrice] = useState<string>('100');
  const [maxPrice, setMaxPrice] = useState<string>('500');
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  // Get filter parameters from URL
  const { getParam, updateParams, clearParams } = useFilterParams();

  // Load filter values from URL parameters on component mount only
  useEffect(() => {
    if (initialLoad) {
      // Retrieve values from URL parameters
      const urlSortBy = getParam('sortby');
      const urlColor = getParam('color');
      const urlSize = getParam('size');
      const urlSearch = getParam('search');
      const urlMinPrice = getParam('minPrice');
      const urlMaxPrice = getParam('maxPrice');

      // Set state values based on URL parameters without triggering unnecessary updates
      let updates = false;

      if (urlSortBy) {
        setSortBy(urlSortBy);
        updates = true;
      }

      if (urlColor) {
        setSelectedColor(urlColor);
        updates = true;
      }

      if (urlSize) {
        setSelectedSize(urlSize);
        updates = true;
      }

      if (urlSearch) {
        setSearchTerm(urlSearch);
        updates = true;
      }

      // Handle price range if both min and max are provided
      if (urlMinPrice && urlMaxPrice) {
        const min = parseInt(urlMinPrice, 10);
        const max = parseInt(urlMaxPrice, 10);

        if (!isNaN(min) && !isNaN(max)) {
          setMinPrice(urlMinPrice);
          setMaxPrice(urlMaxPrice);
          setPriceRange([min, max]);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          updates = true;
        }
      }

      setInitialLoad(false);
    }
  }, [getParam, initialLoad]); // Only depends on getParam and initialLoad flag

  // Handle price range slider change
  const handlePriceRangeChange = (values: [number, number]) => {
    setPriceRange(values);
    setMinPrice(values[0].toString());
    setMaxPrice(values[1].toString());
  };

  // Handle minimum price input change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPrice(value);

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue <= priceRange[1]) {
      setPriceRange([numValue, priceRange[1]]);
    }
  };

  // Handle maximum price input change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPrice(value);

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= priceRange[0]) {
      setPriceRange([priceRange[0], numValue]);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchTerm });
  };

  // Apply all filters
  const handleApplyFilters = () => {
    updateParams({
      sortby: sortBy,
      color: selectedColor,
      size: selectedSize,
      minPrice: minPrice,
      maxPrice: maxPrice,
      search: searchTerm,
    });
  };

  // Reset all filters
  const handleReset = () => {
    setSortBy('');
    setSelectedColor('');
    setSelectedSize('');
    setSearchTerm('');
    setPriceRange([100, 500]);
    setMinPrice('100');
    setMaxPrice('500');
    clearParams(['sortby', 'color', 'size', 'minPrice', 'maxPrice', 'search']);
  };

  // Check if any filters are applied
  const hasActiveFilters = !!(
    selectedColor ||
    selectedSize ||
    sortBy ||
    searchTerm ||
    minPrice !== '100' ||
    maxPrice !== '500'
  );

  return (
    <section className="mb-12 px-4 md:px-0">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {/* Heading */}
        <div>
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Discover Products
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Handpicked selection just for you — 4 products
          </p>
        </div>

        {/* Search and Filter Row */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          <div className="flex w-full gap-2 sm:w-auto">
            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full md:w-[300px] lg:w-[400px]"
            >
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </form>

            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={hasActiveFilters ? 'default' : 'outline'}
                  className="min-w-fit gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {hasActiveFilters ? 'Filters Applied' : 'Filter'}
                  </span>
                </Button>
              </SheetTrigger>

              <SheetContent className="w-full px-6 py-6 sm:max-w-md">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-xl">Filters</SheetTitle>
                  <SheetDescription>
                    Narrow down your product selection
                  </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-15rem)] pr-2">
                  <div className="space-y-8">
                    {/* Category */}
                    <div>
                      <h3 className="mb-3 text-base font-medium">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {['All', 'Men', 'Women', 'Accessories'].map((cat) => (
                          <Button
                            key={cat}
                            variant="outline"
                            className="rounded-full text-sm"
                          >
                            {cat}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Sort */}
                    <div>
                      <h3 className="mb-3 text-base font-medium">Sort by</h3>
                      <Select
                        value={sortBy}
                        onValueChange={(value: string) => setSortBy(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select sorting" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="popular">Popular</SelectItem>
                          <SelectItem value="new">Newest</SelectItem>
                          <SelectItem value="priceLow">
                            Price: Low to High
                          </SelectItem>
                          <SelectItem value="priceHigh">
                            Price: High to Low
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Price Range */}
                    <div>
                      <h3 className="mb-3 text-base font-medium">
                        Price Range
                      </h3>
                      <Slider
                        value={priceRange}
                        onValueChange={handlePriceRangeChange}
                        max={1000}
                        step={10}
                      />
                      <div className="mt-4 flex gap-4">
                        <Input
                          placeholder="$ Min"
                          className="w-full"
                          value={minPrice}
                          onChange={handleMinPriceChange}
                          type="number"
                        />
                        <Input
                          placeholder="$ Max"
                          className="w-full"
                          value={maxPrice}
                          onChange={handleMaxPriceChange}
                          type="number"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Sizes */}
                    <div>
                      <h3 className="mb-3 text-base font-medium">Sizes</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                          <Button
                            key={size}
                            variant={
                              selectedSize === size ? 'default' : 'outline'
                            }
                            className="w-full"
                            onClick={() =>
                              setSelectedSize(selectedSize === size ? '' : size)
                            }
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Colors */}
                    <div>
                      <h3 className="mb-3 text-base font-medium">Colors</h3>
                      <div className="flex flex-wrap gap-3">
                        {[
                          '#000',
                          '#f00',
                          '#0f0',
                          '#00f',
                          '#fff',
                          '#ffa500',
                        ].map((color) => (
                          <button
                            key={color}
                            className={clsx(
                              'h-8 w-8 rounded-full border transition hover:ring-2',
                              selectedColor === color
                                ? 'ring-2 ring-offset-2'
                                : '',
                              color === '#fff'
                                ? 'border-gray-300'
                                : 'border-transparent'
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              setSelectedColor(
                                selectedColor === color ? '' : color
                              )
                            }
                            aria-label={`Color ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <SheetFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
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
    <section className="mb-12 px-4 md:px-0">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {/* Heading Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Search and Filter Skeleton */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          <div className="flex w-full gap-2 sm:w-auto">
            <Skeleton className="h-10 w-full md:w-[300px] lg:w-[400px]" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </section>
  );
}
