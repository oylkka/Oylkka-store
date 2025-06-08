'use client';
import {
  Edit,
  Eye,
  MoreHorizontal,
  Package,
  Star,
  Trash2,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Product {
  id: string;
  productName: string;
  price: number;
  discountPrice: number | null;
  slug: string;
  stock: number;
  category: {
    name: string;
    slug: string;
  };
  freeShipping: boolean;
  discountPercent: number;
  updatedAt: string;
  images: Array<{ url: string }>;
  reviews: Array<{ rating: number }>;
  imageUrl: string;
  reviewCount: number;
  rating: number;
}

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ProductsTableProps {
  products: Product[];
  pagination?: PaginationData;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ProductsTable({
  products,
  pagination,
  currentPage,
  onPageChange,
}: ProductsTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      {return { label: 'Out of Stock', variant: 'destructive' as const };}
    if (stock <= 5) {return { label: 'Low Stock', variant: 'default' as const };}
    return { label: 'In Stock', variant: 'secondary' as const };
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Product</TableHead>
                <TableHead className="w-80">Details</TableHead>
                <TableHead className="w-32">Category</TableHead>
                <TableHead className="w-32">Price</TableHead>
                <TableHead className="w-28">Stock</TableHead>
                <TableHead className="w-24">Rating</TableHead>
                <TableHead className="w-28">Updated</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Avatar className="h-16 w-16 rounded-lg">
                        <AvatarImage
                          src={product.imageUrl || '/placeholder.svg'}
                          alt={product.productName}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-lg">
                          <Package className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="max-w-80">
                      <div className="space-y-1">
                        <p
                          className="line-clamp-2 leading-none font-medium break-words"
                          title={product.productName}
                        >
                          {product.productName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          {product.discountPercent > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-xs whitespace-nowrap"
                            >
                              {product.discountPercent}% OFF
                            </Badge>
                          )}
                          {product.freeShipping && (
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              <Truck className="mr-1 h-3 w-3" />
                              Free Shipping
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {product.discountPrice
                            ? formatPrice(product.discountPrice)
                            : formatPrice(product.price)}
                        </p>
                        {product.discountPrice && (
                          <p className="text-muted-foreground text-sm line-through">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                        <p className="text-muted-foreground text-sm">
                          {product.stock} units
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {product.rating || 0}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(product.updatedAt)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Link
                              className="flex items-center gap-1"
                              href={`/products/${product.slug}`}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {pagination.hasPrev && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(currentPage - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={page === currentPage}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {pagination.hasNext && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(currentPage + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
