'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function ThemeSwitcher({
  mobile = false,
  switch: isSwitch = false,
}: {
  mobile?: boolean;
  switch?: boolean;
}) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle switch toggle
  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  if (!mounted) {
    return null;
  }

  if (mobile) {
    if (isSwitch) {
      return (
        <div className='mt-6 flex items-center justify-between rounded-lg border p-3'>
          <Label htmlFor='theme-switch' className='font-medium'>
            Theme
          </Label>
          <div className='flex items-center gap-2'>
            <Sun className='h-4 w-4' />
            <Switch
              id='theme-switch'
              checked={theme === 'dark'}
              onCheckedChange={handleToggle}
              aria-label='Toggle theme'
            />
            <Moon className='h-4 w-4' />
          </div>
        </div>
      );
    }

    return (
      <div className='mt-6 flex items-center justify-between rounded-lg border p-3'>
        <div className='font-medium'>Theme</div>
        <div className='flex gap-2'>
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size='sm'
            className='h-8 w-8 p-0'
            onClick={() => setTheme('light')}
          >
            <Sun className='h-4 w-4' />
            <span className='sr-only'>Light mode</span>
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size='sm'
            className='h-8 w-8 p-0'
            onClick={() => setTheme('dark')}
          >
            <Moon className='h-4 w-4' />
            <span className='sr-only'>Dark mode</span>
          </Button>
        </div>
      </div>
    );
  }

  if (isSwitch) {
    return (
      <div className='flex items-center gap-2'>
        <Sun className='h-4 w-4' />
        <Switch
          id='theme-switch'
          checked={theme === 'dark'}
          onCheckedChange={handleToggle}
          aria-label='Toggle theme'
        />
        <Moon className='h-4 w-4' />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='hover:bg-primary/10 rounded-full transition-all'
        >
          {theme === 'light' ? (
            <Sun className='h-5 w-5' />
          ) : (
            <Moon className='h-5 w-5' />
          )}
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className='mr-2 h-4 w-4' />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className='mr-2 h-4 w-4' />
          <span>Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
