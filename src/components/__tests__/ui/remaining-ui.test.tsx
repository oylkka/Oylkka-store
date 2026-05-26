import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

describe('Breadcrumb', () => {
  it('renders items with separators', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href='/'>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Current')).toBeTruthy();
  });
});

describe('Checkbox', () => {
  it('renders as unchecked', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeTruthy();
  });
});

describe('Label', () => {
  it('renders text', () => {
    render(<Label>Username</Label>);
    expect(screen.getByText('Username')).toBeTruthy();
  });
});

describe('Separator', () => {
  it('renders', () => {
    const { container } = render(<Separator />);
    expect(container.querySelector('[data-slot="separator"]')).toBeTruthy();
  });
});

describe('Skeleton', () => {
  it('renders', () => {
    const { container } = render(<Skeleton className='w-10 h-10' />);
    expect(container.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });
});

describe('Switch', () => {
  it('renders as toggle', () => {
    render(<Switch />);
    const btn = screen.getByRole('switch');
    expect(btn).toBeTruthy();
  });
});

describe('Textarea', () => {
  it('renders with placeholder', () => {
    render(<Textarea placeholder='Enter text' />);
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });
});
