import { CheckCircle, Download, Monitor, Star } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

        {/* Stats */}
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-blue-600">50K+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-purple-600">1M+</div>
            <div className="text-gray-600">Tests Completed</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-green-600">4.8★</div>
            <div className="text-gray-600">User Rating</div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="container mx-auto px-4">
        <Card className="mx-auto max-w-4xl border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
          <CardContent className="p-12 text-center">
            <Monitor className="mx-auto mb-6 h-16 w-16 opacity-90" />
            <h3 className="mb-4 text-3xl font-bold">
              Ready to Master Bangla Typing?
            </h3>
            <p className="mb-8 text-xl opacity-90">
              Download Oylkka Typing Master for Windows and start your journey
              to becoming a typing expert.
            </p>

            <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="https://drive.google.com/file/d/1WbcSzYibF1bS4dFUEmTBLvcCMctqT__S/view?pli=1"
                target="_blank"
              >
                <Button size="lg" variant="secondary" className="px-8 py-3">
                  <Download className="mr-2 h-5 w-5" />
                  Download for Windows
                </Button>
              </Link>
              <div className="text-sm opacity-75">
                Version 2.1.0 • 15.2 MB • Windows 10/11
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm opacity-75">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Free Download
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                No Registration Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Offline Usage
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
