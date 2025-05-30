'use client';

import { useState } from 'react';

import { useCustomersList } from '@/services';

import { CustomerList } from './customer-list';
import { CustomerListEmpty } from './customer-list-empty';
import { CustomerListError } from './customer-list-error';
import { CustomerListSkeleton } from './customer-list-skeleton';

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { isPending, data, isError } = useCustomersList();

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
    <CustomerList
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
