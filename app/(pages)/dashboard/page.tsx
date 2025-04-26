import { auth } from '@/features/auth/auth';

export default async function Page() {
  const session = await auth();
  return (
    <>
      {session?.user.role === 'ADMIN' ? (
        <p>Admin dashboard</p>
      ) : (
        <p>User dashboard</p>
      )}
      <div className="flex flex-1 flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </>
  );
}
