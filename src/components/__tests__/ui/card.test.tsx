import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <div>content</div>
      </Card>,
    );
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('renders with default size', () => {
    render(<Card>Card</Card>);
    const card = screen.getByText('Card').closest('[data-slot="card"]');
    expect(card?.getAttribute('data-size')).toBe('default');
  });

  it('renders with sm size', () => {
    render(<Card size='sm'>Small</Card>);
    const card = screen.getByText('Small').closest('[data-slot="card"]');
    expect(card?.getAttribute('data-size')).toBe('sm');
  });

  it('renders with custom className', () => {
    render(<Card className='custom'>Custom</Card>);
    const card = screen.getByText('Custom').closest('[data-slot="card"]');
    expect(card?.classList.contains('custom')).toBe(true);
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeTruthy();
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(
      <Card>
        <CardContent>Body text</CardContent>
      </Card>,
    );
    expect(screen.getByText('Body text')).toBeTruthy();
  });
});

describe('CardDescription', () => {
  it('renders description text', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description text</CardDescription>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText('Description text')).toBeTruthy();
  });
});
