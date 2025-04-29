'use client';

import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SignIn() {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Failed to sign in with Google. Please try again.');

      setIsLoadingGoogle(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoadingGitHub(true);
    setError(null);
    try {
      await signIn('github', { callbackUrl: '/dashboard' });
    } catch {
      setError('Failed to sign in with GitHub. Please try again.');
      setIsLoadingGitHub(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="hover:shadow-3xl border-none shadow-2xl transition-all duration-300 dark:shadow-gray-800/50">
          <CardHeader className="space-y-2 pb-6 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Sign in with your preferred provider to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <p className="rounded-md bg-red-50 px-4 py-2 text-center text-sm text-red-500 dark:bg-red-900/20">
                {error}
              </p>
            )}
            <div className="grid gap-4">
              <Button
                variant="outline"
                className="h-12 w-full border-gray-300 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 active:scale-[0.98] dark:border-gray-600 dark:hover:bg-gray-700/50"
                disabled={isLoadingGoogle || isLoadingGitHub}
                onClick={handleGoogleSignIn}
              >
                {isLoadingGoogle ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <div className="flex items-center">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.37-.81 2.53-1.74 3.31v2.77h2.81c1.64-1.51 2.59-3.74 2.59-6.34z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c3.24 0 5.96-1.08 7.95-2.91l-2.81-2.77c-.89.6-2.03.95-3.14.95-2.41 0-4.45-1.63-5.18-3.82H5.92v2.84C7.9 20.92 9.95 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M6.82 14.18c-.18-.54-.28-1.12-.28-1.73s.1-1.19.28-1.73V7.88H5.92C5.36 9.03 5 10.33 5 11.75s.36 2.72 1.92 3.87l.9-3.44z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.38 0 2.61.47 3.58 1.39l2.69-2.69C16.96 2.58 14.74 1.75 12 1.75c-2.05 0-4.1 2.08-6.08 5.87l2.9 2.24c.73-2.19 2.77-3.88 5.18-3.88z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full border-gray-300 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-gray-100 active:scale-[0.98] dark:border-gray-600 dark:hover:bg-gray-700/50"
                disabled={isLoadingGoogle || isLoadingGitHub}
                onClick={handleGitHubSignIn}
              >
                {isLoadingGitHub ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21 .69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    Sign in with GitHub
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
