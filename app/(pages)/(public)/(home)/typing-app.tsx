import { Download, Star } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="py-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-16 text-center">
        <Badge variant="secondary" className="mb-4">
          <Star className="mr-1 h-3 w-3" />
          New Release Available
        </Badge>
        <h1 className="mb-6 text-4xl font-bold md:text-6xl">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Oylkka
          </span>{' '}
          Typing Master
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          Master your Bangla typing skills with our advanced typing speed test
          application. Perfect your accuracy and boost your WPM with engaging
          practice sessions.
        </p>
        <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="https://drive.google.com/file/d/1WbcSzYibF1bS4dFUEmTBLvcCMctqT__S/view?pli=1"
            target="_blank"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="mr-2 h-5 w-5" />
              Download for Windows
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="px-8 py-3">
            View Features
          </Button>
        </div>
      </section>
    </div>
  );
}
