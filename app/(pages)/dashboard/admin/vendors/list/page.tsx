'use client';

import { useState } from 'react';

import { useVendorsList } from '@/services/admin/vendors';

import { CustomerListEmpty } from './customer-list-empty';
import { CustomerListError } from './customer-list-error';
import { CustomerListSkeleton } from './customer-list-skeleton';
import { VendorList } from './vendor-list';

export default function VendorsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { isPending, data, isError } = useVendorsList();

  if (isPending) {
    return <CustomerListSkeleton />;
  }
  if (isError) {
    return <CustomerListError />;
  }

  const customers = data;

  // Filter customers based on search query and filters

  if (customers.length === 0) {
    return <CustomerListEmpty />;
  }

  return (
    <VendorList
      customers={customers}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      roleFilter={roleFilter}
      onRoleFilterChange={setRoleFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
    />
  );
}
