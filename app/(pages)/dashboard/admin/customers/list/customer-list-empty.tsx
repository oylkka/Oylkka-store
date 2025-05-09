import { UserPlus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CustomerListEmpty() {
  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="bg-muted rounded-full p-3">
          <Users className="text-muted-foreground h-10 w-10" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No customers yet</h3>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          You haven&#39t added any customers to your system yet. Start by adding
          your first customer.
        </p>
        <Button className="mt-6">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Your First Customer
        </Button>
      </div>
    </div>
  );
}
