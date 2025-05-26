import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ChatLoadingSkeleton() {
  return (
    <div className="from-background to-muted/20 flex h-full flex-col bg-gradient-to-br">
      {/* Header Skeleton */}
      <div className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 flex-none border-b backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full lg:hidden" />
            <Skeleton className="hidden h-8 w-8 rounded-full lg:block" />

            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 overflow-hidden">
        <div className="space-y-6 p-6">
          {/* Date Badge */}
          <div className="flex justify-center">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Message Bubbles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 3 === 0 ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[75%] items-end gap-3 ${i % 3 === 0 ? 'flex-row-reverse' : ''}`}
              >
                {i % 3 !== 0 && (
                  <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
                )}
                <div className="space-y-2">
                  <Skeleton
                    className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-32'} rounded-2xl`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 flex-none border-t backdrop-blur">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
