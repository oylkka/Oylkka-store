import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { AlertCircle, MailCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Footer from '#/components/layout/footer';
import Header from '#/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { sendVerificationEmail } from '@/lib/auth-client';

export const Route = createFileRoute('/auth/verify')({
  validateSearch: (
    search: Record<string, string | undefined>,
  ): { error?: string } => ({
    error: search.error,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { error } = Route.useSearch();

  if (!error) {
    return <SuccessView />;
  }

  return <ErrorView />;
}

function SuccessView() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: '/dashboard' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <Header />
      <div className='container flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center py-12'>
        <Card className='w-full max-w-md'>
          <CardContent className='flex flex-col items-center gap-4 p-8 text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
              <MailCheck className='h-8 w-8 text-green-600 dark:text-green-400' />
            </div>
            <h1 className='text-2xl font-bold'>Email Verified!</h1>
            <p className='text-muted-foreground text-balance'>
              Your email has been verified successfully. You're now signed in.
            </p>
            <p className='text-xs text-muted-foreground'>
              Redirecting to dashboard in 3 seconds...
            </p>
            <Button
              className='mt-2'
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}

function ErrorView() {
  const { error } = Route.useSearch();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const errorMessages: Record<string, string> = {
    TOKEN_EXPIRED: 'This verification link has expired.',
    INVALID_TOKEN: 'This verification link is invalid.',
    'lost-verification-email':
      'Please enter your email to receive a new verification link.',
  };

  const errorTitle: Record<string, string> = {
    TOKEN_EXPIRED: 'Link Expired',
    INVALID_TOKEN: 'Invalid Link',
    'lost-verification-email': 'Lost Verification Email?',
  };

  const errorKey = error || 'unknown';
  const title = errorTitle[errorKey] || 'Verification Failed';
  const message =
    errorMessages[errorKey] ||
    'Something went wrong. Please request a new verification link.';

  async function handleResend() {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setIsLoading(true);
    try {
      const { error: sendError } = await sendVerificationEmail({ email });
      if (sendError) {
        toast.error('Failed to send', {
          description: sendError.message || 'Please try again later.',
        });
        return;
      }
      toast.success('Verification email sent!', {
        description: 'Please check your inbox.',
      });
    } catch {
      toast.error('Unexpected error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className='container flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] items-center justify-center py-12'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6 md:p-8'>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20'>
                  <AlertCircle className='h-6 w-6 text-amber-600 dark:text-amber-400' />
                </div>
                <h1 className='text-2xl font-bold'>{title}</h1>
                <p className='text-muted-foreground text-balance text-sm'>
                  {message}
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  autoComplete='email'
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <Button
                  type='button'
                  onClick={handleResend}
                  disabled={isLoading}
                  className='w-full'
                >
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </Field>

              <FieldDescription className='text-center'>
                <Link
                  to='/auth/signin'
                  className='text-sm underline underline-offset-4 hover:text-primary'
                >
                  Back to sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
