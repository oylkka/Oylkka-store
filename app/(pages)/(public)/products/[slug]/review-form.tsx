'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Loader2, Star } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { ImagePreview } from './ImagePreview';

const reviewFormSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().max(100, 'Title can be at most 100 characters').optional(),
  content: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review can be at most 1000 characters'),
  images: z
    .array(z.instanceof(File))
    .max(3, 'You can upload up to 3 images')
    .optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  userId: string;
  isSubmitting: boolean;
  onSubmit: (data: ReviewFormValues) => Promise<void>;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  isOpen,
  onClose,
  isSubmitting,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      title: '',
      content: '',
      images: [],
    },
  });

  const watchedImages = form.watch('images');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentImages = form.getValues('images') || [];
    const remainingSlots = 3 - currentImages.length;

    if (files.length > remainingSlots && remainingSlots > 0) {
      toast.warning(`You can only add ${remainingSlots} more image(s). Max 3.`);
    } else if (remainingSlots <= 0) {
      toast.error('You cannot add more than 3 images.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const newImages = files.slice(0, remainingSlots);
    form.setValue('images', [...currentImages, ...newImages], {
      shouldValidate: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    const currentImages = form.getValues('images') || [];
    form.setValue(
      'images',
      currentImages.filter((_, index) => index !== indexToRemove),
      { shouldValidate: true }
    );
  };

  const handleSubmit = async (data: ReviewFormValues) => {
    if (data.rating === 0) {
      form.setError('rating', { message: 'Please select a star rating.' });
      return;
    }

    await onSubmit(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
          <DialogDescription>
            Let others know what you think about this product.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 pt-2"
          >
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <Button
                          key={r}
                          type="button"
                          variant={field.value >= r ? 'default' : 'outline'}
                          size="icon"
                          className={cn(
                            'h-9 w-9 transition-colors',
                            field.value >= r
                              ? 'text-yellow-foreground bg-yellow-400 hover:bg-yellow-500'
                              : 'text-muted-foreground'
                          )}
                          onClick={() => field.onChange(r)}
                          aria-label={`Rate ${r} out of 5 stars`}
                        >
                          <Star
                            className={cn(
                              'h-5 w-5',
                              field.value >= r && 'fill-current'
                            )}
                          />
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Excellent quality!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you like or dislike? How did you use the product?"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Add Photos (Optional)</FormLabel>
                  <div className="flex flex-wrap items-center gap-2">
                    {(watchedImages || []).map((file, index) => (
                      <ImagePreview
                        key={index}
                        file={file}
                        onRemove={() => removeImage(index)}
                      />
                    ))}
                    {(watchedImages || []).length < 3 && (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/png, image/jpeg, image/webp"
                          multiple
                          onChange={handleImageUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-dashed"
                          aria-label="Upload images"
                        >
                          <ImagePlus className="text-muted-foreground mb-1 h-5 w-5" />
                          <span className="text-muted-foreground text-xs">
                            Add
                          </span>
                        </Button>
                      </>
                    )}
                  </div>
                  <FormDescription className="text-xs">
                    You can upload up to 3 images (PNG, JPG, WEBP).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
