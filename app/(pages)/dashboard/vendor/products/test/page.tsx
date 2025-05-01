'use client';
import {
  AlertCircle,
  ImagePlus,
  PlusCircle,
  TrashIcon,
  Upload,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function ProductAddPage() {
  const [product, setProduct] = useState({
    productName: '',
    slug: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    tags: [],
    sku: '',
    price: 0,
    discountPrice: '',
    discountPercent: '',
    stock: 0,
    brand: '',
    condition: 'NEW',
    weight: '',
    weightUnit: 'kg',
    freeShipping: false,
    images: [],
    status: 'DRAFT',
    featured: false,
    attributes: {},
  });

  const [variants, setVariants] = useState([]);
  const [newVariant, setNewVariant] = useState({
    name: '',
    sku: '',
    price: 0,
    discountPrice: '',
    stock: 0,
    attributes: {},
    images: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');
  const [attributeOptions, setAttributeOptions] = useState({});

  // Mock category data - in a real app, this would come from an API
  const categories = [
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Clothing' },
    { id: '3', name: 'Home & Garden' },
    { id: '4', name: 'Books' },
  ];

  // Mock conditions
  const conditions = ['NEW', 'USED', 'REFURBISHED'];

  // Add tag
  const addTag = () => {
    if (tagInput.trim() !== '' && !product.tags.includes(tagInput.trim())) {
      setProduct({
        ...product,
        tags: [...product.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag) => {
    setProduct({
      ...product,
      tags: product.tags.filter((t) => t !== tag),
    });
  };

  // Add product attribute option
  const addAttributeOption = () => {
    if (attributeKey && attributeValue) {
      setAttributeOptions({
        ...attributeOptions,
        [attributeKey]: attributeOptions[attributeKey]
          ? [...attributeOptions[attributeKey], attributeValue]
          : [attributeValue],
      });
      setAttributeValue('');
    }
  };

  // Remove attribute option
  const removeAttributeOption = (key, value) => {
    setAttributeOptions({
      ...attributeOptions,
      [key]: attributeOptions[key].filter((v) => v !== value),
    });
  };

  // Add variant
  const addVariant = () => {
    if (newVariant.name && newVariant.sku) {
      setVariants([...variants, { ...newVariant, id: Date.now().toString() }]);
      setNewVariant({
        name: '',
        sku: '',
        price: 0,
        discountPrice: '',
        stock: 0,
        attributes: {},
        images: [],
      });
      setShowVariantForm(false);
    }
  };

  // Remove variant
  const removeVariant = (id) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  // Update variant attribute
  const updateVariantAttribute = (id, key, value) => {
    setVariants(
      variants.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            attributes: {
              ...v.attributes,
              [key]: value,
            },
          };
        }
        return v;
      })
    );
  };

  // Handle file upload for product images
  const handleProductImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    setProduct({
      ...product,
      images: [...product.images, ...newImages],
    });
  };

  // Handle file upload for variant images
  const handleVariantImageUpload = (e, variantId) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    setVariants(
      variants.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            images: [...v.images, ...newImages],
          };
        }
        return v;
      })
    );
  };

  // Remove product image
  const removeProductImage = (id) => {
    setProduct({
      ...product,
      images: product.images.filter((img) => img.id !== id),
    });
  };

  // Remove variant image
  const removeVariantImage = (variantId, imageId) => {
    setVariants(
      variants.map((v) => {
        if (v.id === variantId) {
          return {
            ...v,
            images: v.images.filter((img) => img.id !== imageId),
          };
        }
        return v;
      })
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Add New Product</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Basic Information */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name*</Label>
                    <Input
                      id="productName"
                      value={product.productName}
                      onChange={(e) =>
                        setProduct({ ...product, productName: e.target.value })
                      }
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug*</Label>
                    <Input
                      id="slug"
                      value={product.slug}
                      onChange={(e) =>
                        setProduct({ ...product, slug: e.target.value })
                      }
                      placeholder="product-name-slug"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description*</Label>
                  <Textarea
                    id="description"
                    value={product.description}
                    onChange={(e) =>
                      setProduct({ ...product, description: e.target.value })
                    }
                    placeholder="Detailed product description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={product.shortDescription}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        shortDescription: e.target.value,
                      })
                    }
                    placeholder="Brief product description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category*</Label>
                    <Select
                      value={product.categoryId}
                      onValueChange={(value) =>
                        setProduct({ ...product, categoryId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={product.brand}
                      onChange={(e) =>
                        setProduct({ ...product, brand: e.target.value })
                      }
                      placeholder="Brand name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add product tags"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addTag())
                      }
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>
                Set up your product pricing and inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU*</Label>
                    <Input
                      id="sku"
                      value={product.sku}
                      onChange={(e) =>
                        setProduct({ ...product, sku: e.target.value })
                      }
                      placeholder="SKU"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price*</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Discount Price</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.discountPrice}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          discountPrice: e.target.value
                            ? parseFloat(e.target.value)
                            : '',
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock*</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          stock: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition*</Label>
                    <Select
                      value={product.condition}
                      onValueChange={(value) =>
                        setProduct({ ...product, condition: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <div className="flex gap-2">
                      <Input
                        id="weight"
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.weight}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            weight: e.target.value
                              ? parseFloat(e.target.value)
                              : '',
                          })
                        }
                        placeholder="0.00"
                      />
                      <Select
                        value={product.weightUnit}
                        onValueChange={(value) =>
                          setProduct({ ...product, weightUnit: value })
                        }
                        className="w-24"
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="oz">oz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeShipping"
                    checked={product.freeShipping}
                    onCheckedChange={(checked) =>
                      setProduct({ ...product, freeShipping: checked })
                    }
                  />
                  <Label htmlFor="freeShipping">Free Shipping</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Variants Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    Add variants for your product (color, size, etc.)
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowVariantForm(!showVariantForm)}
                >
                  {showVariantForm ? 'Cancel' : 'Add Variant'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Product Attributes Section */}
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-medium">Product Attributes</h3>
                <Alert variant="outline" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Define Attributes</AlertTitle>
                  <AlertDescription>
                    Define product attributes (like Color, Size) and their
                    possible values before creating variants.
                  </AlertDescription>
                </Alert>

                <div className="mb-4 flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="attributeKey">Attribute Name</Label>
                    <Input
                      id="attributeKey"
                      value={attributeKey}
                      onChange={(e) => setAttributeKey(e.target.value)}
                      placeholder="e.g. Color, Size"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="attributeValue">Attribute Value</Label>
                    <Input
                      id="attributeValue"
                      value={attributeValue}
                      onChange={(e) => setAttributeValue(e.target.value)}
                      placeholder="e.g. Red, XL"
                    />
                  </div>
                  <Button onClick={addAttributeOption} className="mb-1">
                    Add
                  </Button>
                </div>

                {Object.keys(attributeOptions).length > 0 && (
                  <div className="space-y-3">
                    {Object.keys(attributeOptions).map((key) => (
                      <div key={key} className="rounded-md border p-3">
                        <div className="mb-2 font-medium">{key}</div>
                        <div className="flex flex-wrap gap-2">
                          {attributeOptions[key].map((value) => (
                            <Badge
                              key={value}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {value}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() =>
                                  removeAttributeOption(key, value)
                                }
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Variant Form */}
              {showVariantForm && (
                <div className="mb-6 rounded-md border p-4">
                  <h3 className="mb-4 text-lg font-medium">New Variant</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="variantName">Variant Name*</Label>
                        <Input
                          id="variantName"
                          value={newVariant.name}
                          onChange={(e) =>
                            setNewVariant({
                              ...newVariant,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g. Red - XL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variantSku">SKU*</Label>
                        <Input
                          id="variantSku"
                          value={newVariant.sku}
                          onChange={(e) =>
                            setNewVariant({
                              ...newVariant,
                              sku: e.target.value,
                            })
                          }
                          placeholder="Variant SKU"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="variantPrice">Price*</Label>
                        <Input
                          id="variantPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newVariant.price}
                          onChange={(e) =>
                            setNewVariant({
                              ...newVariant,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variantDiscountPrice">
                          Discount Price
                        </Label>
                        <Input
                          id="variantDiscountPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newVariant.discountPrice}
                          onChange={(e) =>
                            setNewVariant({
                              ...newVariant,
                              discountPrice: e.target.value
                                ? parseFloat(e.target.value)
                                : '',
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variantStock">Stock*</Label>
                        <Input
                          id="variantStock"
                          type="number"
                          min="0"
                          value={newVariant.stock}
                          onChange={(e) =>
                            setNewVariant({
                              ...newVariant,
                              stock: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Variant Attributes */}
                    {Object.keys(attributeOptions).length > 0 && (
                      <div className="space-y-2">
                        <Label>Variant Attributes</Label>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {Object.keys(attributeOptions).map((key) => (
                            <div key={key} className="space-y-2">
                              <Label>{key}</Label>
                              <Select
                                onValueChange={(value) =>
                                  setNewVariant({
                                    ...newVariant,
                                    attributes: {
                                      ...newVariant.attributes,
                                      [key]: value,
                                    },
                                  })
                                }
                                value={newVariant.attributes[key] || ''}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select ${key}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {attributeOptions[key].map((value) => (
                                    <SelectItem key={value} value={value}>
                                      {value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Variant Images</Label>
                      <div className="rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
                        <input
                          type="file"
                          id="variantImages"
                          multiple
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setNewVariant({
                              ...newVariant,
                              images: [
                                ...newVariant.images,
                                ...files.map((file) => ({
                                  id: Date.now() + Math.random(),
                                  name: file.name,
                                  url: URL.createObjectURL(file),
                                  file,
                                })),
                              ],
                            });
                          }}
                        />
                        <label
                          htmlFor="variantImages"
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <ImagePlus className="h-10 w-10 text-gray-400" />
                            <span className="text-gray-600">
                              Click to upload variant images
                            </span>
                            <span className="text-xs text-gray-400">
                              (or drag and drop)
                            </span>
                          </div>
                        </label>
                      </div>

                      {newVariant.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4 md:grid-cols-4">
                          {newVariant.images.map((img) => (
                            <div key={img.id} className="group relative">
                              <img
                                src={img.url}
                                alt={img.name}
                                className="h-24 w-full rounded-md object-cover"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() =>
                                  setNewVariant({
                                    ...newVariant,
                                    images: newVariant.images.filter(
                                      (i) => i.id !== img.id
                                    ),
                                  })
                                }
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowVariantForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={addVariant}>Add Variant</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Variants List */}
              {variants.length > 0 ? (
                <div className="space-y-4">
                  {variants.map((variant) => (
                    <div key={variant.id} className="rounded-md border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium">{variant.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => removeVariant(variant.id)}
                        >
                          <TrashIcon className="mr-1 h-4 w-4" /> Remove
                        </Button>
                      </div>

                      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                          <span className="text-sm text-gray-500">SKU:</span>
                          <div>{variant.sku}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Price:</span>
                          <div>${variant.price.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">
                            Discount:
                          </span>
                          <div>
                            {variant.discountPrice
                              ? `$${variant.discountPrice.toFixed(2)}`
                              : '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Stock:</span>
                          <div>{variant.stock}</div>
                        </div>
                      </div>

                      {Object.keys(variant.attributes).length > 0 && (
                        <div className="mb-4">
                          <span className="mb-2 block text-sm text-gray-500">
                            Attributes:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(variant.attributes).map(
                              ([key, value]) => (
                                <Badge key={key}>
                                  {key}: {value}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="mb-2 block text-sm text-gray-500">
                          Images:
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="grid grid-cols-4 gap-2">
                            {variant.images.map((img) => (
                              <div key={img.id} className="group relative">
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="h-16 w-16 rounded-md object-cover"
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                  onClick={() =>
                                    removeVariantImage(variant.id, img.id)
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div>
                            <input
                              type="file"
                              id={`${variant.id}-images`}
                              multiple
                              className="hidden"
                              accept="image/*"
                              onChange={(e) =>
                                handleVariantImageUpload(e, variant.id)
                              }
                            />
                            <label
                              htmlFor={`${variant.id}-images`}
                              className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300"
                            >
                              <PlusCircle className="h-6 w-6 text-gray-400" />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed py-8 text-center">
                  <p className="text-gray-500">No variants added yet.</p>
                  {!showVariantForm && (
                    <Button
                      variant="outline"
                      onClick={() => setShowVariantForm(true)}
                      className="mt-2"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Your First
                      Variant
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Images and Status */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload product images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
                <input
                  type="file"
                  id="productImages"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                />
                <label htmlFor="productImages" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <span className="text-gray-600">
                      Click to upload product images
                    </span>
                    <span className="text-xs text-gray-400">
                      (or drag and drop)
                    </span>
                  </div>
                </label>
              </div>

              {product.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {product.images.map((img) => (
                    <div key={img.id} className="group relative">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-32 w-full rounded-md object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeProductImage(img.id)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
              <CardDescription>
                Set your product status and visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={product.status}
                    onValueChange={(value) =>
                      setProduct({ ...product, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={product.featured}
                    onCheckedChange={(checked) =>
                      setProduct({ ...product, featured: checked })
                    }
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your product for search engines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={product.metaTitle || ''}
                    onChange={(e) =>
                      setProduct({ ...product, metaTitle: e.target.value })
                    }
                    placeholder="Meta title for SEO"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={product.metaDescription || ''}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        metaDescription: e.target.value,
                      })
                    }
                    placeholder="Meta description for SEO"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button variant="outline">Save as Draft</Button>
        <Button>Publish Product</Button>
      </div>
    </div>
  );
}
