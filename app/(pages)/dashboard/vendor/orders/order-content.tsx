'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useVendorOrders } from '@/services';

import { OrdersFilters } from './orders-filters';
import OrdersPagination from './orders-pagination';
import { OrdersTable } from './orders-table';

export function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialSort = searchParams.get('sort') || 'updatedAt:desc';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sort, setSort] = useState(initialSort);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const page = Number.parseInt(searchParams.get('page') || '1', 10);

  const { isPending, data, isError, refetch } = useVendorOrders({
    page,
    search: debouncedSearchTerm,
    status: statusFilter,
  });

  // Update query parameters
  const updateQueryParams = useCallback(
    (params: {
      search?: string;
      status?: string;
      sort?: string;
      page?: number;
    }) => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (params.search !== undefined) {
        if (params.search) {
          newParams.set('search', params.search);
        } else {
          newParams.delete('search');
        }
      }
      if (params.status !== undefined) {
        if (params.status && params.status !== 'ALL') {
          newParams.set('status', params.status);
        } else {
          newParams.delete('status');
        }
      }
      if (params.sort !== undefined) {
        if (params.sort) {
          newParams.set('sort', params.sort);
        } else {
          newParams.delete('sort');
        }
      }
      if (params.page !== undefined) {
        newParams.set('page', params.page.toString());
      } else {
        newParams.set('page', '1');
      }
      router.push(`?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  // Handle search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchTerm });
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    updateQueryParams({ status: value });
  };

  // Handle sort change
  const handleSort = (column: string) => {
    const [currentColumn, currentDirection] = sort.split(':');
    const newDirection =
      currentColumn === column && currentDirection === 'desc' ? 'asc' : 'desc';
    const newSort = `${column}:${newDirection}`;
    setSort(newSort);
    updateQueryParams({ sort: newSort });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSort('updatedAt:desc');
    router.push('?page=1');
  };

  // Memoized orders for stable rendering
  const orders = useMemo(() => data?.orders || [], [data]);

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-lg">Error Loading Orders</CardTitle>
            <CardDescription>
              Unable to fetch orders. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Vendor Orders
              </CardTitle>
              <CardDescription className="mt-1">
                Manage and track customer orders for your shop
              </CardDescription>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => toast('Export functionality coming soon!')}
              aria-label="Export orders"
            >
              Export Orders
            </Button>
          </div>
          <OrdersFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            onSearchSubmit={handleSearchSubmit}
            onStatusChange={handleStatusChange}
            onClearFilters={handleClearFilters}
          />
        </CardHeader>
        <CardContent className="p-0">
          <OrdersTable
            orders={orders}
            isPending={isPending}
            sort={sort}
            onSort={handleSort}
            onRefetch={refetch}
          />
        </CardContent>
        {!isPending && data?.pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 p-4">
            <OrdersPagination
              totalPages={data.pagination.totalPages}
              currentPage={data.pagination.currentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
