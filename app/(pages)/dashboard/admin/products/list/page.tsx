'use client';

import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductList } from '@/services';

import { ProductsFilters } from './product-filters';
import { ProductsHeader } from './products-header';
import { ProductsTable } from './products-table';

export default function AdminProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');

  const { isPending, data, isError } = useProductList({
    currentPage,
    search: searchQuery,
    category: selectedCategory,
    sortBy,
  });

  if (isError) {
    return (
      <div className='container mx-auto'>
        <Card className='p-8 text-center'>
          <h2 className='text-destructive mb-2 text-2xl font-semibold'>
            Error Loading Products
          </h2>
          <p className='text-muted-foreground'>
            Failed to load products. Please try again.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6'>
      <ProductsHeader
        totalProducts={data?.pagination?.total || 0}
        resultsCount={data?.filterInfo?.resultsCount || 0}
      />

      <ProductsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {isPending ? (
        <ProductsTableSkeleton />
      ) : (
        <ProductsTable
          products={data?.products || []}
          pagination={data?.pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

function ProductsTableSkeleton() {
  return (
    <Card className='p-6'>
      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          //  biome-ignore lint: error
          <div key={i} className='flex items-center space-x-4'>
            <Skeleton className='h-16 w-16 rounded-lg' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-[250px]' />
              <Skeleton className='h-4 w-[200px]' />
            </div>
            <Skeleton className='h-8 w-[100px]' />
            <Skeleton className='h-8 w-[80px]' />
          </div>
        ))}
      </div>
    </Card>
  );
}
