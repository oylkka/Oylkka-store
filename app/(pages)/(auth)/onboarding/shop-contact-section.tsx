'use client';

import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Twitter,
} from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { OnboardingFormValues } from '@/schemas';

export default function ShopContactSection() {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="rounded-lg border p-6">
        <h3 className="mb-2 text-base font-semibold">Contact Information</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          How customers can reach your business
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={control}
            name="shopEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  Shop Email*
                </FormLabel>
                <FormControl>
                  <Input placeholder="shop@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="shopPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  Shop Phone*
                </FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="rounded-lg border p-6">
        <h3 className="mb-2 text-base font-semibold">Social Media</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Connect your shop to your social channels (optional)
        </p>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="socialLinks.facebook"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2 rounded-md border p-2 transition-all hover:border-blue-400 hover:bg-gray-50">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <Input
                        type="url"
                        placeholder="https://facebook.com/yourshop"
                        className="flex-1 border-0 bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="socialLinks.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2 rounded-md border p-2 transition-all hover:border-pink-400 hover:bg-gray-50">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <Input
                        type="url"
                        placeholder="https://instagram.com/yourshop"
                        className="flex-1 border-0 bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="socialLinks.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2 rounded-md border p-2 transition-all hover:border-blue-400 hover:bg-gray-50">
                      <Twitter className="h-5 w-5 text-blue-400" />
                      <Input
                        type="url"
                        placeholder="https://twitter.com/yourshop"
                        className="flex-1 border-0 bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="socialLinks.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2 rounded-md border p-2 transition-all hover:border-blue-400 hover:bg-gray-50">
                      <Linkedin className="h-5 w-5 text-blue-700" />
                      <Input
                        type="url"
                        placeholder="https://linkedin.com/company/yourshop"
                        className="flex-1 border-0 bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="socialLinks.website"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2 rounded-md border p-2 transition-all hover:border-green-400 hover:bg-gray-50">
                    <Globe className="h-5 w-5 text-green-600" />
                    <Input
                      type="url"
                      placeholder="https://yourshop.com"
                      className="flex-1 border-0 bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
