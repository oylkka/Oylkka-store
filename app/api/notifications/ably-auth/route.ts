import Ably from 'ably';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/features/auth/auth';
// biome-ignore lint: error
export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // biome-ignore lint: error
  const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: session.user.id,
  });

  return NextResponse.json(tokenRequest);
}
