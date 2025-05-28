'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDisplayName, getInitials } from '@/lib/utils';

interface OnlineUsersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userDetails: any[];
}

export function OnlineUsers({ userDetails }: OnlineUsersProps) {
  if (userDetails.length === 0) {
    return null;
  }

  return (
    <div className="mx-4 mt-2">
      <Card className="bg-background/80 backdrop-blur-sm">
        <CardContent className="p-3">
          <h3 className="mb-2 text-sm font-semibold">Online Users</h3>
          <div className="flex flex-wrap gap-2">
            {userDetails.map((user) => (
              <div
                key={user.id}
                className="bg-muted/50 flex items-center gap-2 rounded-full px-3 py-1"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={formatDisplayName(user)}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-medium text-white">
                    {getInitials(formatDisplayName(user))}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{formatDisplayName(user)}</span>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                >
                  Online
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
