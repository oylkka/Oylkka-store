import { ImagePlus, Star, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Type definitions
interface ProductReview {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
  helpful: number;
}

interface ProductReviewsProps {
  avgRating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  onSubmitReview?: (rating: number, comment: string) => void;
}

// Rating Display Component
export const RatingDisplay: React.FC<{
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ rating, size = 'md' }) => {
  const starSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage = Math.min(
          Math.max((rating - (star - 1)) * 100, 0),
          100
        );

        return (
          <div key={star} className="relative">
            <Star className={cn(starSize[size], 'text-gray-300')} />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star
                className={cn(
                  starSize[size],
                  'fill-yellow-400 text-yellow-400'
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Image Preview Component
const ImagePreview: React.FC<{
  file: File;
  onRemove: () => void;
}> = ({ file, onRemove }) => {
  const imageUrl = URL.createObjectURL(file);

  React.useEffect(() => {
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  return (
    <div className="group relative h-20 w-20 overflow-hidden rounded-lg border">
      <Image
        height={200}
        width={200}
        src={imageUrl}
        alt="Review"
        className="h-full w-full object-cover"
      />
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </div>
  );
};

// Sample reviews for demonstration (in a real app, these would come from props)
const mockReviews: ProductReview[] = [
  {
    id: '1',
    userId: 'user1',
    rating: 5,
    comment:
      'Absolutely love this product! It exceeded all my expectations. The quality is outstanding and it looks even better in person than in the photos.',
    createdAt: '2023-05-15T08:00:00Z',
    user: {
      name: 'Sarah Johnson',
      image: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
    helpful: 24,
  },
  {
    id: '2',
    userId: 'user2',
    rating: 4,
    comment:
      'Great product overall. Slight delay in shipping but the quality makes up for it. Would recommend to friends and family.',
    createdAt: '2023-04-22T15:30:00Z',
    user: {
      name: 'Michael Chen',
      image: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    helpful: 15,
  },
  {
    id: '3',
    userId: 'user3',
    rating: 5,
    comment:
      'Perfect fit for my needs. The customer service was exceptional when I had questions before purchasing.',
    createdAt: '2023-03-18T11:45:00Z',
    user: {
      name: 'Emma Williams',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
    },
    helpful: 19,
  },
];

const ProductReviews: React.FC<ProductReviewsProps> = ({
  avgRating = 4.3,
  reviewCount = 100,
  reviews = mockReviews,
  onSubmitReview,
}) => {
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Distribution of ratings for visualization
  const ratingDistribution = [
    { stars: 5, count: 65 },
    { stars: 4, count: 25 },
    { stars: 3, count: 7 },
    { stars: 2, count: 2 },
    { stars: 1, count: 1 },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remainingSlots = 3 - reviewImages.length;
    const newImages = files.slice(0, remainingSlots);

    setReviewImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submitReview = () => {
    if (onSubmitReview) {
      onSubmitReview(reviewRating, reviewComment);
    }
    setReviewDialogOpen(false);
    setReviewComment('');
    setReviewImages([]);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Review Summary */}
        <div className="w-full md:w-1/3">
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-4 text-xl font-bold">Customer Reviews</h3>
            <div className="mb-6 text-center">
              <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
              <div className="mt-2">
                <RatingDisplay rating={avgRating} size="lg" />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Based on {reviewCount} reviews
              </p>
            </div>

            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{item.stars} stars</div>
                  <Progress
                    value={(item.count / reviewCount) * 100}
                    className="h-2"
                  />
                  <div className="w-10 text-right text-sm text-gray-500">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>

            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-6 w-full">Write a Review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                  <DialogDescription>
                    Share your experience with this product
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          type="button"
                          variant="outline"
                          size="icon"
                          className={cn(
                            'h-10 w-10',
                            reviewRating >= rating && 'bg-yellow-100'
                          )}
                          onClick={() => setReviewRating(rating)}
                        >
                          <Star
                            className={cn(
                              'h-5 w-5',
                              reviewRating >= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            )}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Your Review</Label>
                    <Textarea
                      id="comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Photos</Label>
                    <div className="flex flex-wrap gap-2">
                      {reviewImages.map((file, index) => (
                        <ImagePreview
                          key={index}
                          file={file}
                          onRemove={() => removeImage(index)}
                        />
                      ))}
                      {reviewImages.length < 3 && (
                        <>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-gray-300 hover:border-gray-400"
                          >
                            <ImagePlus className="h-6 w-6 text-gray-400" />
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload up to 3 images (optional)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReviewDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={submitReview}>
                    Submit Review
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Review List */}
        <div className="w-full md:w-2/3">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Reviews</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Most Recent
              </Button>
              <Button variant="ghost" size="sm">
                Highest Rated
              </Button>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={review.user.image}
                            alt={review.user.name}
                          />
                          <AvatarFallback>
                            {review.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.user.name}</p>
                          <div className="flex items-center">
                            <RatingDisplay rating={review.rating} size="sm" />
                            <span className="ml-2 text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Verified Purchase</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-gray-700">{review.comment}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500"
                      >
                        {review.helpful} people found this helpful
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Helpful
                        </Button>
                        <Button variant="ghost" size="sm">
                          Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-gray-500">
                No reviews yet. Be the first to review this product!
              </p>
              <Button
                className="mt-4"
                onClick={() => setReviewDialogOpen(true)}
              >
                Write a Review
              </Button>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button variant="outline">Load More Reviews</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
