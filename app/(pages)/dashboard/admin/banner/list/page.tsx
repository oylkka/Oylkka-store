'use client';

import { format } from 'date-fns';
import {
  CalendarIcon,
  Edit,
  Eye,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BannerType } from '@/lib/types';
import { useAdminBannerList, useDeleteBanner } from '@/services';

import { BannerPreview } from './banner-preview';

export default function AdminBannerListPage() {
  const { isPending, data, isError } = useAdminBannerList();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [previewBanner, setPreviewBanner] = useState<BannerType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const { mutate: deleteBanner, isPending: isDeleting } = useDeleteBanner();

  const handleOpenPreview = (banner: BannerType) => {
    setPreviewBanner(banner);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handleOpenDeleteDialog = (bannerId: string) => {
    setBannerToDelete(bannerId);
    setIsAlertOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsAlertOpen(false);
    setBannerToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (bannerToDelete) {
      deleteBanner(
        { id: bannerToDelete },
        {
          onSettled: () => {
            handleCloseDeleteDialog(); // Close dialog after deletion (success or failure)
          },
        },
      );
    }
  };

  // Handle loading state
  if (isPending) {
    return <BannerListSkeleton view={view} />;
  }

  // Handle error state
  if (isError) {
    return (
      <div className='flex h-[50vh] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100'>
          {/* biome-ignore lint: error */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-10 w-10 text-red-600'
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' x2='12' y1='8' y2='12' />
            <line x1='12' x2='12.01' y1='16' y2='16' />
          </svg>
        </div>
        <h3 className='mt-4 text-lg font-semibold'>Error Loading Banners</h3>
        <p className='text-muted-foreground mt-2 text-sm'>
          We encountered an issue while fetching your banners. Please try again
          later.
        </p>
        <Button
          variant='outline'
          className='mt-4'
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const banners = data || [];

  // Group banners by position with proper TypeScript typing
  const bannersByPosition = (banners as BannerType[]).reduce<
    Record<string, BannerType[]>
  >((acc: Record<string, BannerType[]>, banner: BannerType) => {
    const position = banner.bannerPosition || 'other';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(banner);
    return acc;
  }, {});

  const positions = Object.keys(bannersByPosition);

  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Banner Management
          </h1>
          <p className='text-muted-foreground'>
            Manage your website banners and promotional content
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center space-x-2'>
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size='icon'
              onClick={() => setView('grid')}
              className='h-9 w-9'
            >
              <LayoutGrid className='h-4 w-4' />
              <span className='sr-only'>Grid view</span>
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size='icon'
              onClick={() => setView('list')}
              className='h-9 w-9'
            >
              <List className='h-4 w-4' />
              <span className='sr-only'>List view</span>
            </Button>
          </div>
          <Link href='/dashboard/admin/banner/add'>
            <Button className='flex items-center gap-1'>
              <Plus className='h-4 w-4' />
              <span>Add Banner</span>
            </Button>
          </Link>
        </div>
      </div>

      {banners.length === 0 ? (
        <div className='flex h-[50vh] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
          <div className='bg-muted mx-auto flex h-20 w-20 items-center justify-center rounded-full'>
            {/* biome-ignore lint: error */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='text-muted-foreground h-10 w-10'
            >
              <rect width='18' height='10' x='3' y='7' rx='2' />
              <path d='M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2' />
              <line x1='9' x2='9' y1='12' y2='12' />
              <line x1='15' x2='15' y1='12' y2='12' />
            </svg>
          </div>
          <h3 className='mt-4 text-lg font-semibold'>No Banners Found</h3>
          <p className='text-muted-foreground mt-2 text-sm'>
            You haven&#39;t created any banners yet. Get started by creating a
            new banner.
          </p>
          <Link href='/dashboard/admin/banner/add'>
            <Button className='mt-4'>
              <Plus className='mr-2 h-4 w-4' />
              Create Banner
            </Button>
          </Link>
        </div>
      ) : (
        <Tabs defaultValue={positions[0]} className='w-full'>
          <TabsList className='mb-6 w-full justify-start overflow-x-auto'>
            {positions.map((position) => (
              <TabsTrigger
                key={position}
                value={position}
                className='capitalize'
              >
                {position.replace(/_/g, ' ')}
                <Badge variant='outline' className='ml-2'>
                  {bannersByPosition[position].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {positions.map((position) => (
            <TabsContent key={position} value={position} className='mt-0'>
              {view === 'grid' ? (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  {bannersByPosition[position].map((banner: BannerType) => (
                    <BannerCard
                      key={banner.id}
                      banner={banner}
                      onPreview={handleOpenPreview}
                      onDelete={() => handleOpenDeleteDialog(banner.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className='rounded-md border'>
                  <div className='text-muted-foreground grid grid-cols-12 gap-4 p-4 font-medium'>
                    <div className='col-span-4'>Banner</div>
                    <div className='col-span-2'>Position</div>
                    <div className='col-span-2'>Status</div>
                    <div className='col-span-2'>Created</div>
                    <div className='col-span-2 text-right'>Actions</div>
                  </div>
                  <div className='divide-y'>
                    {bannersByPosition[position].map((banner: BannerType) => (
                      <BannerRow
                        key={banner.id}
                        banner={banner}
                        onPreview={handleOpenPreview}
                        onDelete={() => handleOpenDeleteDialog(banner.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Banner Preview Dialog */}
      <BannerPreview
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        banner={previewBanner}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface BannerCardProps {
  banner: BannerType;
  onPreview: (banner: BannerType) => void;
  onDelete: (bannerId: string) => void;
}

function BannerCard({ banner, onPreview, onDelete }: BannerCardProps) {
  return (
    <Card className='overflow-hidden pt-0'>
      <div className='bg-muted aspect-video w-full overflow-hidden'>
        <Image
          height={1000}
          width={1000}
          src={banner.image.url || '/placeholder.svg'}
          alt={banner.image.alt || banner.title}
          className='h-full w-full object-cover object-center transition-all hover:scale-105'
        />
      </div>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <Badge
            variant={banner.isActive ? 'default' : 'outline'}
            className='mb-1.5'
          >
            {banner.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <MoreHorizontal className='h-4 w-4' />
                <span className='sr-only'>Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onPreview(banner)}>
                <Eye className='mr-2 h-4 w-4' />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  className='flex w-full items-center gap-2'
                  href={`/dashboard/admin/banner/edit?bannerId=${banner.id}`}
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-red-600'
                onClick={() => onDelete(banner.id)}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className='line-clamp-1'>{banner.title}</CardTitle>
        <CardDescription className='line-clamp-2'>
          {banner.subTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className='pb-2'>
        <div className='flex flex-wrap gap-2'>
          {banner.bannerTag && (
            <Badge variant='secondary' className='capitalize'>
              {banner.bannerTag}
            </Badge>
          )}
          <Badge variant='outline' className='capitalize'>
            {banner.alignment} aligned
          </Badge>
          <Badge variant='outline' className='capitalize'>
            {banner.bannerPosition.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className='text-muted-foreground flex items-center justify-between text-sm'>
        <div className='flex items-center'>
          <CalendarIcon className='mr-1 h-3.5 w-3.5' />
          <span>{format(new Date(banner.createdAt), 'MMM d, yyyy')}</span>
        </div>
        <div className='flex items-center gap-1'>
          <span className='font-medium'>{banner.primaryActionText}</span>
          <span>→</span>
        </div>
      </CardFooter>
    </Card>
  );
}

interface BannerRowProps {
  banner: BannerType;
  onPreview: (banner: BannerType) => void;
  onDelete: (bannerId: string) => void;
}

function BannerRow({ banner, onPreview, onDelete }: BannerRowProps) {
  return (
    <div className='grid grid-cols-12 items-center gap-4 p-4'>
      <div className='col-span-4 flex items-center gap-3'>
        <div className='bg-muted h-12 w-20 overflow-hidden rounded-md'>
          <Image
            height={1000}
            width={1000}
            src={banner.image.url || '/placeholder.svg'}
            alt={banner.image.alt || banner.title}
            className='h-full w-full object-cover'
          />
        </div>
        <div>
          <p className='font-medium'>{banner.title}</p>
          <p className='text-muted-foreground line-clamp-1 text-sm'>
            {banner.subTitle}
          </p>
        </div>
      </div>
      <div className='col-span-2'>
        <Badge variant='outline' className='capitalize'>
          {banner.bannerPosition.replace(/_/g, ' ')}
        </Badge>
      </div>
      <div className='col-span-2'>
        <Badge variant={banner.isActive ? 'default' : 'outline'}>
          {banner.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <div className='text-muted-foreground col-span-2 text-sm'>
        {format(new Date(banner.createdAt), 'MMM d, yyyy')}
      </div>
      <div className='col-span-2 flex justify-end'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <MoreHorizontal className='h-4 w-4' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onPreview(banner)}>
              <Eye className='mr-2 h-4 w-4' />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                className='flex w-full items-center gap-2'
                href={`/dashboard/admin/banner/edit?bannerId=${banner.id}`}
              >
                <Edit className='mr-2 h-4 w-4' />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-red-600'
              onClick={() => onDelete(banner.id)}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function BannerListSkeleton({ view }: { view: 'grid' | 'list' }) {
  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='mt-2 h-4 w-48' />
        </div>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-9 w-20' />
        </div>
      </div>

      <div className='mb-6 flex'>
        <Skeleton className='h-10 w-32 rounded-full' />
        <Skeleton className='ml-2 h-10 w-32 rounded-full' />
        <Skeleton className='ml-2 h-10 w-32 rounded-full' />
      </div>

      {view === 'grid' ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              // biome-ignore lint: error
              <Card key={i} className='overflow-hidden'>
                <Skeleton className='aspect-video w-full' />
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-5 w-16' />
                  </div>
                  <Skeleton className='h-6 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </CardHeader>
                <CardContent className='pb-2'>
                  <div className='flex gap-2'>
                    <Skeleton className='h-5 w-16' />
                    <Skeleton className='h-5 w-16' />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className='h-4 w-24' />
                </CardFooter>
              </Card>
            ))}
        </div>
      ) : (
        <div className='rounded-md border'>
          <div className='p-4'>
            <Skeleton className='h-6 w-full' />
          </div>
          <div className='divide-y'>
            {Array(6)
              .fill(0)
              .map((_, i) => (
                // biome-ignore lint: error
                <div key={i} className='p-4'>
                  <Skeleton className='h-16 w-full' />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
