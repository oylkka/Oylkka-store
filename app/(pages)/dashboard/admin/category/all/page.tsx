'use client';

import { format } from 'date-fns';
import {
  AlertTriangle,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner'; // or your preferred toast library

import { checkCategoryDeletionSafety, deleteCategory } from '@/actions';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CategoriesType } from '@/lib/types';
import { useAdminCategoryList } from '@/services/admin/category';

export default function CategoriesPage() {
  const { isPending, data, isError, refetch } = useAdminCategoryList();
  const [selectedCategory, setSelectedCategory] =
    useState<CategoriesType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoriesType | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deletionSafety, setDeletionSafety] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingDeletion, setIsCheckingDeletion] = useState(false);

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleViewDetails = (category: CategoriesType) => {
    setSelectedCategory(category);
    setOpenDialog(true);
  };

  const handleDeleteClick = async (category: CategoriesType) => {
    setCategoryToDelete(category);
    setIsCheckingDeletion(true);

    try {
      const safety = await checkCategoryDeletionSafety(category.id);
      setDeletionSafety(safety);
      setDeleteDialog(true);
    } catch (error) {
      toast.error('Failed to check category dependencies');
      console.error('Delete check error:', error);
    } finally {
      setIsCheckingDeletion(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteCategory(categoryToDelete.id, {
        force: !deletionSafety?.canDelete, // Use force if there are dependencies
      });

      if (result.success) {
        toast.success(result.message || 'Category deleted successfully');
        setDeleteDialog(false);
        setCategoryToDelete(null);
        setDeletionSafety(null);
        refetch(); // Refresh the categories list
      } else {
        toast.error(result.message || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog(false);
    setCategoryToDelete(null);
    setDeletionSafety(null);
  };

  const renderDependencyWarning = () => {
    if (!deletionSafety?.dependencies) {
      return null;
    }

    const { subcategories, products, posts } = deletionSafety.dependencies;
    const warnings = [];

    if (subcategories > 0) {
      warnings.push(
        `${subcategories} subcategorie${subcategories > 1 ? 's' : ''}`
      );
    }
    if (products > 0) {
      warnings.push(`${products} product${products > 1 ? 's' : ''}`);
    }
    if (posts > 0) {
      warnings.push(`${posts} post${posts > 1 ? 's' : ''}`);
    }

    if (warnings.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              This category has associated content:
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-yellow-700">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-yellow-700">
              These items will be unlinked from this category when deleted.
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (isError) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Failed to load categories</h3>
          <p className="text-muted-foreground">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Categories</CardTitle>
              <CardDescription>
                Manage your product categories and organization
              </CardDescription>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex h-[400px] w-full items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.map((category: CategoriesType) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="relative h-10 w-10 overflow-hidden rounded-md">
                          <Image
                            src={
                              category.image.url ||
                              '/placeholder.svg?height=40&width=40' ||
                              '/placeholder.svg'
                            }
                            alt={category.image.alt || category.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.slug}
                      </TableCell>
                      <TableCell>
                        {category.featured ? (
                          <Badge variant="default">
                            <Star className="mr-1 h-3 w-3 fill-white" />{' '}
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(category.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                handleViewDetails(category);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                className="flex w-full gap-2"
                                href={`/dashboard/admin/category/edit?slug=${category.slug}`}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={(e) => {
                                e.preventDefault();
                                handleDeleteClick(category);
                              }}
                              disabled={isCheckingDeletion}
                            >
                              {isCheckingDeletion ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[525px]">
          {selectedCategory && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedCategory.name}
                </DialogTitle>
                <DialogDescription>
                  Category details and information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="relative mx-auto aspect-square h-48 w-48 overflow-hidden rounded-lg">
                  <Image
                    src={
                      selectedCategory.image.url ||
                      '/placeholder.svg?height=192&width=192' ||
                      '/placeholder.svg'
                    }
                    alt={selectedCategory.image.alt || selectedCategory.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Slug:</div>
                    <div className="text-muted-foreground col-span-2">
                      {selectedCategory.slug}
                    </div>
                  </div>
                  {selectedCategory.description && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="font-medium">Description:</div>
                      <div className="text-muted-foreground col-span-2">
                        {selectedCategory.description}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Featured:</div>
                    <div className="col-span-2">
                      {selectedCategory.featured ? (
                        <Badge variant="default">
                          <Star className="mr-1 h-3 w-3 fill-white" /> Featured
                        </Badge>
                      ) : (
                        <Badge variant="outline">Standard</Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Created:</div>
                    <div className="text-muted-foreground col-span-2">
                      {formatDate(selectedCategory.createdAt)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Updated:</div>
                    <div className="text-muted-foreground col-span-2">
                      {formatDate(selectedCategory.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="text-destructive h-5 w-5" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{categoryToDelete?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {renderDependencyWarning()}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
