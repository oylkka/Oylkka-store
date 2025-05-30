'use client';

import { format } from 'date-fns';
import { ArrowUpDown, Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useVendorOrders } from '@/services';

// Pagination component (assumed implementation)
interface OrdersPaginationProps {
  totalPages: number;
  currentPage: number;
}

function OrdersPagination({ totalPages, currentPage }: OrdersPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', page.toString());
    router.push(`?${newParams.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="Next page"
      >
        Next
      </Button>
    </div>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialSort = searchParams.get('sort') || 'updatedAt:desc';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sort, setSort] = useState(initialSort);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { isPending, data, isError } = useVendorOrders({
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
        newParams.set('page', '1'); // Reset to first page
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

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Skeleton rows for loading state
  const renderSkeletonRows = (count: number = 5) =>
    Array.from({ length: count }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-40" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="ml-auto h-4 w-16" />
        </TableCell>
      </TableRow>
    ));

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
              onClick={() => router.refresh()}
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
              onClick={() => alert('Export functionality coming soon!')}
              aria-label="Export orders"
            >
              Export Orders
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <form
              className="relative flex-1"
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <Search
                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                placeholder="Search by order number, customer name, or email"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search orders"
              />
              <Button type="submit" className="sr-only">
                Search
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={handleStatusChange}
                aria-label="Filter by order status"
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={!searchTerm && statusFilter === 'ALL'}
                aria-label="Clear filters"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('paymentStatus')}
                  >
                    <div className="flex items-center gap-1">
                      Payment
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Total
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  renderSkeletonRows()
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-gray-500"
                    >
                      No orders found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow
                      key={order.id}
                      onClick={() =>
                        router.push(
                          `/dashboard/vendor/orders/single-order?orderId=${order.orderNumber}`
                        )
                      }
                      className="cursor-pointer"
                      role="link"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        router.push(
                          `/dashboard/vendor/orders/${order.orderNumber}`
                        )
                      }
                    >
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-sm text-gray-500">
                            {order.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {format(
                            new Date(order.updatedAt),
                            'MMM d, yyyy, hh:mm a'
                          )}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                        <p className="mt-1 text-xs text-gray-500">
                          {order.paymentMethod}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`View items for order ${order.orderNumber}`}
                            >
                              {order.items.length} Item
                              {order.items.length !== 1 ? 's' : ''}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">
                                Order Items ({order.items.length})
                              </h4>
                              <ul className="space-y-2">
                                {order.items.map(
                                  (item: {
                                    id: string;
                                    productName: string;
                                    price: number;
                                    quantity: number;
                                  }) => (
                                    <li
                                      key={item.id}
                                      className="flex justify-between text-sm"
                                    >
                                      <span>
                                        {item.productName} (x{item.quantity})
                                      </span>
                                      <span>
                                        $
                                        {(item.price * item.quantity).toFixed(
                                          2
                                        )}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">
                          {order.currency || 'USD'} {order.total.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {!isPending && data?.pagination.totalPages > 1 && (
          <CardFooter className="justify-center border-t border-gray-100 p-4">
            <OrdersPagination
              totalPages={data.pagination.totalPages}
              currentPage={data.pagination.currentPage}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full max-w-md" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
