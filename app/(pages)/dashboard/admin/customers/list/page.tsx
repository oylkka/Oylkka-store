'use client';

import { useState } from 'react';

import { CustomerListType } from '@/lib/types';
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
  const filteredCustomers = customers.filter((customer: CustomerListType) => {
    const matchesSearch =
      !searchQuery ||
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone &&
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || customer.role === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && customer.isActive) ||
      (statusFilter === 'INACTIVE' && !customer.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (customers.length === 0) {
    return <CustomerListEmpty />;
  }

  return (
    <CustomerList
      customers={filteredCustomers}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      roleFilter={roleFilter}
      onRoleFilterChange={setRoleFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
    />
  );
}
