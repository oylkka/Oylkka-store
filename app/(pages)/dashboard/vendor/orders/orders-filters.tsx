'use client';

import { Search, X } from 'lucide-react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrdersFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  onSearchSubmit: (e: React.FormEvent) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
}

export function OrdersFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  onSearchSubmit,
  onStatusChange,
  onClearFilters,
}: OrdersFiltersProps) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row'>
      <form className='relative flex-1' onSubmit={onSearchSubmit}>
        <Search
          className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2'
          aria-hidden='true'
        />
        <Input
          placeholder='Search by order number, customer name, or email'
          className='pl-10'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label='Search orders'
        />
        <Button type='submit' className='sr-only'>
          Search
        </Button>
      </form>
      <div className='flex items-center gap-2'>
        <Select
          value={statusFilter}
          onValueChange={onStatusChange}
          aria-label='Filter by order status'
        >
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Filter status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All Statuses</SelectItem>
            <SelectItem value='PENDING'>Pending</SelectItem>
            <SelectItem value='PROCESSING'>Processing</SelectItem>
            <SelectItem value='SHIPPED'>Shipped</SelectItem>
            <SelectItem value='DELIVERED'>Delivered</SelectItem>
            <SelectItem value='CANCELLED'>Cancelled</SelectItem>
            <SelectItem value='REFUNDED'>Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant='outline'
          size='sm'
          onClick={onClearFilters}
          disabled={!searchTerm && statusFilter === 'ALL'}
          aria-label='Clear filters'
        >
          <X className='mr-2 h-4 w-4' />
          Clear
        </Button>
      </div>
    </div>
  );
}
