import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeTruthy();
  });

  it('renders with default variant attribute', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge.getAttribute('data-variant')).toBe('default');
  });

  it('renders with secondary variant', () => {
    render(<Badge variant='secondary'>Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge.getAttribute('data-variant')).toBe('secondary');
  });

  it('renders with destructive variant', () => {
    render(<Badge variant='destructive'>Danger</Badge>);
    const badge = screen.getByText('Danger');
    expect(badge.getAttribute('data-variant')).toBe('destructive');
  });

  it('renders with custom class name', () => {
    render(<Badge className='custom'>Styled</Badge>);
    const badge = screen.getByText('Styled');
    expect(badge.classList.contains('custom')).toBe(true);
  });
});

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder='Enter text' />);
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with default type', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input.tagName).toBe('INPUT');
  });

  it('renders with email type', () => {
    render(<Input type='email' />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('type')).toBe('email');
  });

  it('renders disabled', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox').hasAttribute('disabled')).toBe(true);
  });

  it('renders with custom class', () => {
    render(<Input className='custom' />);
    expect(screen.getByRole('textbox').classList.contains('custom')).toBe(true);
  });
});

describe('Textarea', () => {
  it('renders with placeholder', () => {
    render(<Textarea placeholder='Describe...' />);
    expect(screen.getByPlaceholderText('Describe...')).toBeTruthy();
  });

  it('renders disabled', () => {
    render(<Textarea disabled />);
    expect(screen.getByRole('textbox').hasAttribute('disabled')).toBe(true);
  });
});

describe('Label', () => {
  it('renders with text', () => {
    render(<Label>Name</Label>);
    expect(screen.getByText('Name')).toBeTruthy();
  });

  it('associates with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor='email'>Email</Label>
        <Input id='email' />
      </>,
    );
    const label = screen.getByText('Email');
    expect(label.getAttribute('for')).toBe('email');
  });
});

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />);
    const div = container.querySelector('[data-slot="skeleton"]');
    expect(div).toBeTruthy();
  });

  it('renders with custom class', () => {
    const { container } = render(<Skeleton className='h-10 w-full' />);
    const div = container.querySelector('[data-slot="skeleton"]');
    expect(div?.classList.contains('h-10')).toBe(true);
  });
});

describe('Separator', () => {
  it('renders as horizontal by default', () => {
    render(<Separator />);
    const el = document.querySelector('[data-slot="separator"]');
    expect(el).toBeTruthy();
  });
});
