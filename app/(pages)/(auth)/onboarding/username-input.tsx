'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

interface UsernameInputProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export function UsernameInput({
  name,
  label,
  placeholder = 'Choose a username',
  required = false,
}: UsernameInputProps) {
  const { register, setValue, watch, formState } = useFormContext();
  const username = watch(name);
  const [debouncedUsername] = useDebounce(username, 300);

  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [hasFocused, setHasFocused] = useState(false);

  const hasErrors = formState.errors[name];

  // Check availability whenever the debounced username changes
  useEffect(() => {
    async function checkAvailability() {
      if (!debouncedUsername || debouncedUsername.length < 3 || !hasFocused) {
        setIsAvailable(null);
        setSuggestions([]);
        setMessage('');
        return;
      }

      setIsChecking(true);
      try {
        const res = await fetch(
          `/api/auth/onboarding/username?username=${encodeURIComponent(debouncedUsername)}`
        );
        const data = await res.json();

        setIsAvailable(data.available);
        if (!data.available) {
          setSuggestions(data.suggestions || []);
          setMessage(data.message || 'Username not available');
        } else {
          setSuggestions([]);
          setMessage('');
        }
      } catch (error) {
        console.error('Failed to check username availability', error);
        setMessage('Error checking availability');
      } finally {
        setIsChecking(false);
      }
    }

    checkAvailability();
  }, [debouncedUsername, hasFocused]);

  const handleSuggestionClick = (suggestion: string) => {
    setValue(name, suggestion, { shouldValidate: true });
  };

  const generateNewSuggestions = async () => {
    if (!username) return;

    setIsChecking(true);
    const randomSuffix = Math.floor(Math.random() * 1000);
    const newSuggestion = `${username}${randomSuffix}`;

    try {
      const res = await fetch(
        `/api/auth/onboarding/username?username=${encodeURIComponent(newSuggestion)}`
      );
      const data = await res.json();

      if (data.available) {
        setSuggestions([newSuggestion, ...suggestions.slice(0, 2)]);
      } else {
        generateNewSuggestions();
      }
    } catch (error) {
      console.error('Failed to generate new suggestions', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>

        {isChecking && (
          <span className="text-muted-foreground flex items-center text-sm">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Checking...
          </span>
        )}

        {!isChecking && isAvailable === true && username && (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Available
          </Badge>
        )}

        {!isChecking && isAvailable === false && username && (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Not available
          </Badge>
        )}
      </div>

      <div className="relative">
        <Input
          id={name}
          placeholder={placeholder}
          className={`pr-10 ${hasErrors ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...register(name)}
          onFocus={() => setHasFocused(true)}
        />

        {isChecking && (
          <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform animate-spin" />
        )}

        {!isChecking && isAvailable === true && username && (
          <CheckCircle className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-green-500" />
        )}

        {!isChecking && isAvailable === false && username && (
          <XCircle className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-red-500" />
        )}
      </div>

      {/* Error message */}
      {hasErrors && (
        <p className="mt-1 text-xs text-red-500">
          {formState.errors[name]?.message as string}
        </p>
      )}

      {/* Username available message */}
      {!isChecking && isAvailable === true && username && !hasErrors && (
        <p className="mt-1 text-xs text-green-600">
          Great choice! This username is available.
        </p>
      )}

      {/* Username not available message */}
      {!isChecking && isAvailable === false && username && !hasErrors && (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-red-600">{message}</p>

          {/* Suggestions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                Suggestions:
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={generateNewSuggestions}
                disabled={isChecking}
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                New suggestions
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  className="bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
