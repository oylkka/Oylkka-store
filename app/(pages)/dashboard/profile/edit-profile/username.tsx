// components/ui/UsernameField.tsx
'use client';

import { AlertCircle, AtSign, Check, Loader2 } from 'lucide-react';
import { JSX } from 'react';
import { Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface UsernameFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  username: string | undefined;
  isUsernameValid: boolean;
  isPending: boolean;
  usernameSuggestions: string[];
  usernameErrorMessage: string | null;
  setValue: (name: string, value: string) => void;
  onCheckUsername: (username: string) => Promise<void>;
}

export function UsernameField({
  control,
  username,
  isUsernameValid,
  isPending,
  usernameSuggestions,
  usernameErrorMessage,
  setValue,
  onCheckUsername,
}: UsernameFieldProps): JSX.Element {
  return (
    <FormField
      control={control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <AtSign className="h-4 w-4" />
            Username <span className="text-red-500">*</span>
          </FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                placeholder="Choose a unique username"
                {...field}
                aria-invalid={usernameErrorMessage ? 'true' : 'false'}
                aria-describedby={
                  usernameErrorMessage ? 'username-error' : undefined
                }
                className={
                  username && !isPending
                    ? isUsernameValid
                      ? 'border-green-500 pr-10 focus-visible:ring-green-300'
                      : usernameErrorMessage
                        ? 'border-red-300 pr-10 focus-visible:ring-red-200'
                        : ''
                    : ''
                }
                onBlur={(e) => {
                  field.onBlur();
                  if (e.target.value) {
                    onCheckUsername(e.target.value);
                  }
                }}
              />
            </FormControl>
            {username && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : isUsernameValid ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : usernameErrorMessage ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            )}
          </div>

          {usernameErrorMessage && !isPending && (
            <p
              id="username-error"
              className="mt-1 text-sm font-medium text-red-500"
            >
              {usernameErrorMessage}
            </p>
          )}

          {usernameSuggestions.length > 0 && (
            <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Try one of these instead:
              </p>
              <div className="flex flex-wrap gap-2">
                {usernameSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setValue('username', suggestion);
                      onCheckUsername(suggestion);
                    }}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
