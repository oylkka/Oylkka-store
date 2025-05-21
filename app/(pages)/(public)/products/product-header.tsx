'use client';

import { Search, SlidersHorizontal } from 'lucide-react';

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

export default function ProductHeader({
  totalProducts,
}: {
  totalProducts: number;
}) {
  return (
    <section className="mb-12 px-4 md:px-0">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {/* Heading */}
        <div>
          <h1 className="text-foreground text-4xl font-bold tracking-tight">
            Discover Products
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Handpicked selection just for you - {totalProducts} products
          </p>
        </div>

        {/* Search and Filter Row */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          <div className="flex w-full gap-2 sm:w-auto">
            {/* Search */}
            <form className="relative w-full md:w-[300px] lg:w-[400px]">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-9"
              />
            </form>

            {/* Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button className="min-w-fit gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
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
                      <Select>
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
                      <Slider max={1000} step={10} />
                      <div className="mt-4 flex gap-4">
                        <Input
                          placeholder="৳ Min"
                          className="w-full"
                          type="number"
                        />
                        <Input
                          placeholder="৳ Max"
                          className="w-full"
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
                          <Button key={size} className="w-full">
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
                            style={{ backgroundColor: color }}
                            aria-label={`Color ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <SheetFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Reset
                  </Button>
                  <Button className="w-full sm:w-auto">Apply Filters</Button>
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
    <section className="px-4 md:px-0">
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
