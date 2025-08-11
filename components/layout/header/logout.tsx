'use client';

import { signOut } from 'next-auth/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export function SignOut() {
  const handleSignOut = async () => {
    await signOut({ redirect: false }); // Prevent default server-side redirect
    window.location.href = '/'; // Manually redirect to homepage
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive'>Sign Out</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will sign you out of your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <div>
            <AlertDialogAction asChild>
              <Button
                variant='destructive'
                onClick={handleSignOut}
                className='w-full'
                type='submit'
              >
                Sign Out
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
