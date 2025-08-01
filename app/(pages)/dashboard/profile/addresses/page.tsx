'use client';

import {
  Building,
  Edit,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddress, useDeleteAddress } from '@/services/customer/addresses';

interface Address {
  id: string;
  address: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
  };
  isDefault: boolean;
}

export default function UserAddresses() {
  const { isLoading, data, isError } = useAddress();
  const deleteAddressMutation = useDeleteAddress();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const router = useRouter();

  const handleDeleteAddress = async () => {
    if (!addressToDelete) {
      return;
    }

    try {
      await deleteAddressMutation.mutateAsync(addressToDelete.id);
      toast.success('Address deleted successfully');
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
      // biome-ignore lint: error
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const openDeleteDialog = (address: Address) => {
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-4xl px-4 py-8'>
        <div className='mb-8'>
          <Skeleton className='mb-2 h-8 w-48' />
          <Skeleton className='h-4 w-96' />
        </div>
        <div className='grid gap-6 md:grid-cols-2'>
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint: error
            <Card key={i} className='animate-pulse'>
              <CardHeader className='pb-3'>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-4 w-20' />
              </CardHeader>
              <CardContent className='space-y-3'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
                <div className='flex gap-2 pt-2'>
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-8 w-16' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='container mx-auto max-w-4xl px-4 py-8'>
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
                <MapPin className='h-6 w-6 text-red-600' />
              </div>
              <h3 className='mb-2 text-lg font-semibold text-red-900'>
                Failed to load addresses
              </h3>
              <p className='mb-4 text-red-700'>
                There was an error loading your saved addresses.
              </p>
              <Button
                variant='outline'
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-4xl px-4 py-8'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>My Addresses</h1>
            <p className='text-muted-foreground mt-1'>
              Manage your delivery addresses
            </p>
          </div>
          <Link href='/dashboard/profile/addresses/add' passHref>
            <Button size='lg' className='shadow-sm'>
              <Plus className='mr-2 h-4 w-4' />
              Add New Address
            </Button>
          </Link>
        </div>
      </div>

      {/* Addresses Grid */}
      {data && data.length > 0 ? (
        <div className='grid gap-6 md:grid-cols-2'>
          {data.map((address: Address) => (
            <Card
              key={address.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${
                address.isDefault
                  ? 'ring-primary/20 bg-primary/5 ring-2'
                  : 'hover:shadow-md'
              }`}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className='absolute -top-2 -right-2'>
                  <Badge className='bg-primary text-primary-foreground shadow-sm'>
                    <Star className='mr-1 h-3 w-3 fill-current' />
                    Default
                  </Badge>
                </div>
              )}

              <CardHeader className='pb-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                      <MapPin className='text-primary h-5 w-5' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold'>
                        {address.address.name}
                      </h3>
                      {address.isDefault && (
                        <p className='text-muted-foreground text-sm'>
                          Primary address
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Contact Information */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <Mail className='text-muted-foreground h-4 w-4' />
                    <span className='text-muted-foreground'>
                      {address.address.email}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <Phone className='text-muted-foreground h-4 w-4' />
                    <span className='text-muted-foreground'>
                      {address.address.phone}
                    </span>
                  </div>
                </div>

                {/* Address Information */}
                <div className='space-y-2 border-t pt-2'>
                  <div className='flex items-start gap-2'>
                    <Navigation className='text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0' />
                    <div className='text-sm'>
                      <p className='font-medium'>{address.address.address}</p>
                      <div className='text-muted-foreground mt-1 flex items-center gap-1'>
                        <Building className='h-3 w-3' />
                        <span>
                          {address.address.city}, {address.address.district}
                        </span>
                      </div>
                      <p className='text-muted-foreground'>
                        Postal Code: {address.address.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2 border-t pt-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1 bg-transparent'
                    onClick={() =>
                      router.push(
                        `/dashboard/profile/addresses/edit?addressesId=${address.id}`,
                      )
                    }
                  >
                    <Edit className='mr-2 h-3 w-3' />
                    Edit
                  </Button>
                  <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='bg-transparent text-red-600 hover:bg-red-50 hover:text-red-700'
                        onClick={() => openDeleteDialog(address)}
                      >
                        <Trash2 className='mr-2 h-3 w-3' />
                        Delete
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className='border-dashed'>
          <CardContent className='flex flex-col items-center justify-center py-16'>
            <div className='bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
              <MapPin className='text-muted-foreground h-8 w-8' />
            </div>
            <h3 className='mb-2 text-xl font-semibold'>No addresses yet</h3>
            <p className='text-muted-foreground mb-6 max-w-sm text-center'>
              You haven&#39;t added any delivery addresses yet. Add your first
              address to get started.
            </p>
            <Link href='/dashboard/profile/addresses/add' passHref>
              <Button size='lg'>
                <Plus className='mr-2 h-4 w-4' />
                Add Your First Address
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {addressToDelete && (
            <div className='bg-muted my-4 rounded-lg p-4'>
              <p className='font-medium'>{addressToDelete.address.name}</p>
              <p className='text-muted-foreground text-sm'>
                {addressToDelete.address.address}
              </p>
              <p className='text-muted-foreground text-sm'>
                {addressToDelete.address.city},{' '}
                {addressToDelete.address.district}{' '}
                {addressToDelete.address.postalCode}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteAddressMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteAddress}
              disabled={deleteAddressMutation.isPending}
            >
              {deleteAddressMutation.isPending
                ? 'Deleting...'
                : 'Delete Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
