'use client';

import { format } from 'date-fns';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

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
import { useAdminOrderList } from '@/service';
import { AdminOrderListType } from '@/types';

import OrdersPagination from './orders-pagination';

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || 'ALL';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const { isPending, data, isError } = useAdminOrderList({
    currentPage: page,
    search: searchTerm,
    status: statusFilter,
  });

  // Update query parameters on filter/search change
  const updateQueryParams = (params: { search?: string; status?: string }) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (params.search !== undefined) {
      if (params.search) {
        newParams.set('search', params.search);
      } else {
        newParams.delete('search');
      }
    }

    if (params.status !== undefined) {
      if (params.status) {
        newParams.set('status', params.status);
      } else {
        newParams.delete('status');
      }
    }

    newParams.set('page', '1'); // Reset to first page
    router.push(`?${newParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchTerm });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    updateQueryParams({ status: value });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSkeletonRows = (count: number = 5) =>
    Array.from({ length: count }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="ml-auto h-4 w-16" />
        </TableCell>
      </TableRow>
    ));

  if (isError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">Failed to load orders</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <Card className="shadow-md">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Orders</CardTitle>
              <CardDescription>Manage all your customer orders</CardDescription>
            </div>
            <Button variant="outline">Export</Button>
          </div>
        </CardHeader>

        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <form className="relative flex-1" onSubmit={handleSearchSubmit}>
              <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number, customer name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" className="sr-only">
                Search
              </Button>
            </form>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Payment
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
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
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-muted-foreground py-10 text-center"
                      >
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.orders.map((order: AdminOrderListType) => (
                      <TableRow
                        key={order.id}
                        onClick={() =>
                          router.push(
                            `/dashboard/admin/orders/single-order?orderId=${order.id}`
                          )
                        }
                        className="cursor-pointer hover:bg-gray-50"
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
                          <div className="text-sm">
                            <p>
                              {format(order.updatedAt, 'MMMM d, yyyy, hh:mm a')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(order.paymentStatus)}
                          >
                            {order.paymentStatus}
                          </Badge>
                          <div className="mt-1 text-xs text-gray-500">
                            {order.paymentMethod}
                          </div>
                        </TableCell>
                        <TableCell className="flex justify-end gap-1 text-right">
                          <span className="font-medium">
                            ${order.total.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <CardFooter className="border-t px-6 py-4">
              {!isPending && !isError && data && data.totalPages > 1 && (
                <CardFooter className="justify-center border-t border-gray-100 p-4">
                  <OrdersPagination
                    totalPages={data.totalPages}
                    currentPage={data.pagination.currentPage}
                  />
                </CardFooter>
              )}
            </CardFooter>
          </>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback>
      <OrdersContent />
    </Suspense>
  );
}
