import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useState } from 'react';
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
import { requestPasswordReset } from '@/lib/auth-client';

export const Route = createFileRoute('/auth/forgot-password')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await requestPasswordReset({ email });

      if (error) {
        toast.error('Failed to send reset email', {
          description: error.message || 'Please try again later.',
        });
        return;
      }

      setSent(true);
      toast.success('Reset link sent!', {
        description: 'Check your email for the password reset link.',
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
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className='flex flex-col items-center gap-2 text-center'>
                  <h1 className='text-2xl font-bold'>Forgot password?</h1>
                  <p className='text-muted-foreground text-balance text-sm'>
                    {sent
                      ? "If an account exists with that email, we've sent a reset link."
                      : "Enter your email and we'll send you a reset link."}
                  </p>
                </div>

                {!sent && (
                  <>
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
                        type='submit'
                        disabled={isLoading}
                        className='w-full'
                      >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                    </Field>
                  </>
                )}

                <FieldDescription className='text-center'>
                  <Link
                    to='/auth/signin'
                    className='text-sm underline underline-offset-4 hover:text-primary'
                  >
                    Back to sign in
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
