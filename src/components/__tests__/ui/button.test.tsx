import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('renders with default variant', () => {
    render(<Button>Default</Button>);
    const button = screen.getByText('Default').closest('button');
    expect(button?.getAttribute('data-variant')).toBe('default');
  });

  it('renders with outline variant', () => {
    render(<Button variant='outline'>Outline</Button>);
    const button = screen.getByText('Outline').closest('button');
    expect(button?.getAttribute('data-variant')).toBe('outline');
  });

  it('renders with destructive variant', () => {
    render(<Button variant='destructive'>Danger</Button>);
    const button = screen.getByText('Danger').closest('button');
    expect(button?.getAttribute('data-variant')).toBe('destructive');
  });

  it('renders disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled').closest('button');
    expect(button?.disabled).toBe(true);
  });

  it('fires onClick handler', () => {
    let clicked = false;
    render(
      <Button
        onClick={() => {
          clicked = true;
        }}
      >
        Click
      </Button>,
    );
    screen.getByText('Click').click();
    expect(clicked).toBe(true);
  });

  it('renders with custom className', () => {
    render(<Button className='custom-class'>Styled</Button>);
    const button = screen.getByText('Styled').closest('button');
    expect(button?.classList.contains('custom-class')).toBe(true);
  });
});
