'use client';

import { easeIn, motion } from 'framer-motion';
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { ShopType } from '@/lib/types';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      easeIn,
    },
  },
};

export default function ShopAbout({ shop }: { shop: ShopType }) {
  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">About {shop.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Shop Description</h3>
              <p className="mt-2 text-gray-600">
                {shop.description || 'No description available.'}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Contact Information</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center">
                  <Mail className="mr-3 h-5 w-5 text-gray-500" />
                  <a
                    href={`mailto:${shop.shopEmail}`}
                    className="hover:underline"
                  >
                    {shop.shopEmail}
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone className="mr-3 h-5 w-5 text-gray-500" />
                  <a href={`tel:${shop.shopPhone}`} className="hover:underline">
                    {shop.shopPhone}
                  </a>
                </li>
                <li className="flex items-center">
                  <MapPin className="mr-3 h-5 w-5 text-gray-500" />
                  <span>{shop.address}</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Social Media</h3>
              <div className="mt-4 flex space-x-3">
                {shop.socialLinks?.website && (
                  <Link
                    href={shop.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                    >
                      <Globe className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                {shop.socialLinks?.facebook && (
                  <Link
                    href={shop.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                    >
                      <Facebook className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                {shop.socialLinks?.instagram && (
                  <Link
                    href={shop.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                    >
                      <Instagram className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                {shop.socialLinks?.twitter && (
                  <Link
                    href={shop.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                    >
                      <Twitter className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                {shop.socialLinks?.linkedin && (
                  <Link
                    href={shop.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
