'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowBigLeft,
  Calendar,
  ImageIcon,
  LayoutGrid,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TagsInput } from '@/components/ui/tags-input';
import { Textarea } from '@/components/ui/textarea';
import { productCategories } from '@/constant';

// Extend the base schema with image fields
const baseSchema = z.object({
  productname: z
    .string()
    .min(2, { message: 'Product name must be at least 2 characters.' }),
  description: z
    .string()
    .min(2, { message: 'Description must be at least 2 characters.' }),
  category: z
    .string()
    .min(2, { message: 'Category must be at least 2 characters.' }),
  subcategory: z
    .string()
    .min(2, { message: 'Subcategory must be at least 2 characters.' }),
  tags: z.array(z.string()).nonempty('Please at least add one tag'),
  price: z.coerce
    .number()
    .min(0.01, { message: 'Price must be greater than 0' }),
  discountPrice: z.coerce.number().optional(),
  discountPercent: z.coerce
    .number()
    .min(0, { message: 'Discount cannot be negative' })
    .max(100, { message: 'Discount cannot exceed 100%' })
    .optional(),
  stock: z.coerce
    .number()
    .min(0, { message: 'Stock cannot be negative' })
    .optional(),
  lowStockAlert: z.coerce
    .number()
    .min(0, { message: 'Low stock alert cannot be negative' })
    .optional(),
  // Shipping & Organization fields
  weight: z.coerce
    .number()
    .min(0, { message: 'Weight cannot be negative' })
    .optional(),
  weightUnit: z.string().optional(),
  length: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  shippingClass: z.string().optional(),
  brand: z.string().optional(),
  vendor: z.string().optional(),
  collections: z.string().optional(),
  // Advanced Options fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  socialImage: z.string().optional(),
  preOrderDate: z.string().optional(),
});

// Refine the schema for stock validation
const FormSchema = baseSchema.refine(
  (data) => {
    if (data.lowStockAlert === undefined || data.stock === undefined) {
      return true;
    }
    return data.lowStockAlert <= data.stock;
  },
  {
    message: 'Low stock alert must be less than or equal to current stock',
    path: ['lowStockAlert'],
  }
);

type FormValues = z.infer<typeof FormSchema>;

// Type for the product image
interface ProductImage {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
}

export default function AddProductPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [preOrderEnabled, setPreOrderEnabled] = useState<boolean>(false);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  // State for product images
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedImage, setDraggedImage] = useState<ProductImage | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      productname: '',
      description: '',
      category: '',
      subcategory: '',
      tags: [],
      price: 0,
      discountPrice: undefined,
      discountPercent: 0,
      stock: 0,
      lowStockAlert: 0,
      // Shipping defaults
      weight: undefined,
      weightUnit: 'kg',
      length: undefined,
      width: undefined,
      height: undefined,
      shippingClass: '',
      brand: '',
      vendor: '',
      collections: '',
      // Advanced Options defaults
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      socialImage: '',
      preOrderDate: '',
    },
  });

  const subcategories =
    productCategories.find((category) => category.value === selectedCategory)
      ?.subcategories || [];

  function onSubmit(values: FormValues) {
    // Create form data to handle file uploads
    const formData = new FormData();

    // Append all form values
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          // Handle arrays like tags
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Append images with cover image first
    const sortedImages = [...productImages].sort((a, b) =>
      a.isCover ? -1 : b.isCover ? 1 : 0
    );

    sortedImages.forEach((image, index) => {
      formData.append(`image-${index}`, image.file);
      if (image.isCover) {
        formData.append('coverImageIndex', String(index));
      }
    });

    // console.log('Form values:', values);
    // console.log('Images:', productImages);
    // In a real app, you would send formData to your API
  }

  // Watch for price and discountPrice changes to calculate discount percentage
  const price = form.watch('price');
  const discountPrice = form.watch('discountPrice');
  const stock = form.watch('stock');

  useEffect(() => {
    if (
      price > 0 &&
      discountPrice !== undefined &&
      discountPrice > 0 &&
      discountPrice < price
    ) {
      const discountPercent = ((price - discountPrice) / price) * 100;
      form.setValue('discountPercent', parseFloat(discountPercent.toFixed(2)));
    } else {
      form.setValue('discountPercent', 0);
    }
  }, [price, discountPrice, form]);

  // Update low stock alert when stock changes if needed
  useEffect(() => {
    const currentAlert = form.getValues('lowStockAlert');
    if (
      currentAlert !== undefined &&
      stock !== undefined &&
      currentAlert > stock
    ) {
      form.setValue('lowStockAlert', stock);
    }
  }, [stock, form]);

  // Handlers for custom specifications (managed outside the form)
  const handleSpecChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    setSpecs((prevSpecs) => {
      const newSpecs = [...prevSpecs];
      newSpecs[index] = { ...newSpecs[index], [field]: value };
      return newSpecs;
    });
  };

  const addSpecField = () => {
    setSpecs((prevSpecs) => [...prevSpecs, { key: '', value: '' }]);
  };

  // Image handling functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    // Check if adding new files would exceed the limit
    if (productImages.length + files.length > 4) {
      alert('You can only upload up to 4 images');
      return;
    }

    const newImages: ProductImage[] = [];

    Array.from(files).forEach((file) => {
      // Create a unique ID for each image
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const preview = URL.createObjectURL(file);

      // First image automatically becomes the cover image if no cover exists
      const isCover =
        productImages.length === 0 &&
        newImages.length === 0 &&
        !productImages.some((img) => img.isCover);

      newImages.push({ id, file, preview, isCover });
    });

    setProductImages([...productImages, ...newImages]);

    // Reset the input to allow selecting the same file again
    event.target.value = '';
  };

  const removeImage = (id: string) => {
    const imageToRemove = productImages.find((img) => img.id === id);
    const wasImageCover = imageToRemove?.isCover || false;

    const updatedImages = productImages.filter((img) => img.id !== id);

    // If the removed image was the cover image, set the first remaining image as cover
    if (wasImageCover && updatedImages.length > 0) {
      updatedImages[0].isCover = true;
    }

    setProductImages(updatedImages);
  };

  const handleDragStart = (image: ProductImage) => {
    setIsDragging(true);
    setDraggedImage(image);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetImage: ProductImage) => {
    if (!draggedImage) {
      return;
    }

    const draggedIndex = productImages.findIndex(
      (img) => img.id === draggedImage.id
    );
    const targetIndex = productImages.findIndex(
      (img) => img.id === targetImage.id
    );

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Create a new array with the images reordered
    const newImages = [...productImages];
    newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    setProductImages(newImages);
    setIsDragging(false);
    setDraggedImage(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedImage(null);
  };

  const setCoverImage = (id: string) => {
    setProductImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  return (
    <div className="space-y-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <ArrowBigLeft />
              </Button>
              <h1 className="text-2xl font-bold">New Product</h1>
            </div>
            <div className="flex items-center gap-5">
              <Button variant="outline" type="button">
                Discard
              </Button>
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" />
                Save Product
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Basic Information */}
            <div className="col-span-12 space-y-6 lg:col-span-8">
              {/* Image Upload Section */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-lg font-semibold">Product Images</span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="image-upload">Upload Images</Label>
                      <FormDescription>
                        You can upload up to 4 images. Drag images to reorder or
                        set as cover image.
                      </FormDescription>

                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={productImages.length >= 4}
                          className="max-w-md"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById('image-upload')?.click()
                          }
                          disabled={productImages.length >= 4}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Browse
                        </Button>
                      </div>
                    </div>

                    {/* Image Preview Section */}
                    {productImages.length > 0 && (
                      <div className="mt-4">
                        <Label>Product Images ({productImages.length}/4)</Label>
                        <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-4">
                          {productImages.map((image) => (
                            <div
                              key={image.id}
                              className={`relative flex flex-col items-center rounded-md border-2 p-2 ${image.isCover ? 'border-blue-500' : 'border-gray-200'} ${isDragging && draggedImage?.id === image.id ? 'opacity-50' : 'opacity-100'} `}
                              draggable
                              onDragStart={() => handleDragStart(image)}
                              onDragOver={handleDragOver}
                              onDrop={() => handleDrop(image)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="relative h-32 w-full">
                                <Image
                                  src={image.preview}
                                  alt="Product preview"
                                  className="h-full w-full rounded-md object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-0 right-0 h-6 w-6 rounded-full"
                                  onClick={() => removeImage(image.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              <Button
                                type="button"
                                variant={image.isCover ? 'default' : 'outline'}
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => setCoverImage(image.id)}
                                disabled={image.isCover}
                              >
                                {image.isCover ? 'Cover Image' : 'Set as Cover'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <LayoutGrid className="h-5 w-5" />
                  <span className="text-lg font-semibold">
                    Basic Information
                  </span>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="productname"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Product Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Category *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCategory(value);
                            form.setValue('subcategory', '');
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {productCategories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedCategory}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a sub category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Subcategory</SelectLabel>
                              {subcategories.map((subcategory) => (
                                <SelectItem
                                  key={subcategory.value}
                                  value={subcategory.value}
                                >
                                  {subcategory.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Tags</FormLabel>
                        <TagsInput
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Enter tags"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Shipping & Organization */}
              <Card>
                <CardHeader className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5" />
                  <span className="text-lg font-semibold">
                    Shipping &amp; Organization
                  </span>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Weight */}
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weightUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="kg" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lb">lb</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Dimensions */}
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Length"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Width" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Height"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Shipping Class */}
                  <FormField
                    control={form.control}
                    name="shippingClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Class</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="express">Express</SelectItem>
                            <SelectItem value="free">Free Shipping</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Organization Details */}
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Select brand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vendor name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="collections"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collections</FormLabel>
                        <FormControl>
                          <Input placeholder="Add to collections" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Pricing, Inventory & Advanced Options */}
            <div className="col-span-12 lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Price &amp; Stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span>Price *</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Product Price"
                              {...field}
                              value={field.value === 0 ? '' : field.value}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ''
                                    ? 0
                                    : parseFloat(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="discountPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Discount price"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ''
                                      ? undefined
                                      : parseFloat(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="discountPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount %</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                readOnly
                                {...field}
                                value={
                                  field.value !== undefined ? field.value : '0'
                                }
                                className="cursor-not-allowed"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <span>Stock</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Stock quantity"
                                {...field}
                                value={field.value === 0 ? '' : field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ''
                                      ? 0
                                      : parseInt(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lowStockAlert"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <span>Low Stock Alert</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Alert threshold"
                                {...field}
                                value={field.value === 0 ? '' : field.value}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ''
                                      ? 0
                                      : parseInt(e.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Options */}
              <Card className="mt-6">
                <CardHeader className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-lg font-semibold">
                    Advanced Options
                  </span>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="seo">
                      <AccordionTrigger>SEO &amp; Marketing</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="metaTitle"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <Label htmlFor="meta-title">Meta Title</Label>
                                <FormControl>
                                  <Input
                                    id="meta-title"
                                    placeholder="SEO title"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="metaDescription"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <Label htmlFor="meta-description">
                                  Meta Description
                                </Label>
                                <FormControl>
                                  <Textarea
                                    id="meta-description"
                                    placeholder="SEO description"
                                    {...field}
                                    className="min-h-[100px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="metaKeywords"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <Label htmlFor="meta-keywords">
                                  Meta Keywords
                                </Label>
                                <FormControl>
                                  <Input
                                    id="meta-keywords"
                                    placeholder="Comma separated keywords"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="socialImage"
                            render={({ field }) => (
                              <FormItem className="space-y-2">
                                <Label htmlFor="social-image">
                                  Social Sharing Image
                                </Label>
                                <FormControl>
                                  <Input
                                    id="social-image"
                                    placeholder="Image URL"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="preorder">
                      <AccordionTrigger>Pre‑Order Settings</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="preorder-toggle">
                              Enable Pre‑Order
                            </Label>
                            <Switch
                              id="preorder-toggle"
                              checked={preOrderEnabled}
                              onCheckedChange={() =>
                                setPreOrderEnabled(!preOrderEnabled)
                              }
                            />
                          </div>
                          {preOrderEnabled && (
                            <FormField
                              control={form.control}
                              name="preOrderDate"
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  <Label htmlFor="preorder-date">
                                    Pre‑Order Date
                                  </Label>
                                  <FormControl>
                                    <Input
                                      id="preorder-date"
                                      type="date"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="specs">
                      <AccordionTrigger>Custom Specifications</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {specs.map((spec, index) => (
                            <div key={index} className="grid grid-cols-2 gap-4">
                              <Input
                                value={spec.key}
                                placeholder="Specification name (e.g., Color)"
                                onChange={(e) =>
                                  handleSpecChange(index, 'key', e.target.value)
                                }
                              />
                              <Input
                                value={spec.value}
                                placeholder="Specification value (e.g., Red)"
                                onChange={(e) =>
                                  handleSpecChange(
                                    index,
                                    'value',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            onClick={addSpecField}
                            className="mt-2 gap-2"
                            type="button"
                          >
                            <Plus className="h-4 w-4" />
                            Add Specification
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
