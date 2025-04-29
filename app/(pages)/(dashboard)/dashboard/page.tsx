import Image from 'next/image';

import { Card } from '@/components/ui/card';
import { auth } from '@/features/auth/auth';

export default async function UserAvatar() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center">
      <Card className="flex items-center justify-center p-20">
        <Image
          src={session.user.image}
          alt="User Avatar"
          height={400}
          width={400}
          className="h-40 w-40 rounded-full"
        />

        <span>{session.user.name}</span>
        <span>{session.user.email}</span>
        <span>{session.user.role}</span>
      </Card>
    </div>
  );
}
