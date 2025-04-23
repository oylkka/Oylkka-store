'use client';

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function OrderCancelPage() {
  const formattedDate = format(new Date(Date.now()), 'PPPpp'); // e.g. Apr 23, 2025 at 3:22 PM

  return (
    <div className="from-background to-muted flex items-center justify-center bg-gradient-to-br px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-3xl border-none bg-white shadow-2xl dark:bg-zinc-900">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Order Cancelled
            </CardTitle>
            <p className="text-muted-foreground mx-auto max-w-xs text-sm">
              Your order has been cancelled. If this was a mistake, please reach
              out to our support team.
            </p>
          </CardHeader>

          <CardContent className="bg-muted/50 mt-2 space-y-2 rounded-xl p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cancelled At:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
          </CardContent>

          <CardFooter className="mt-4 flex flex-col gap-4">
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <Button className="w-full" asChild>
              <Link href="/support">Contact Support</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
