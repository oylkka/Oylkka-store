import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

describe('Avatar', () => {
  it('renders with fallback text', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('JD')).toBeTruthy();
  });

  it('renders with default size', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    const avatar = screen.getByText('AB').closest('[data-slot="avatar"]');
    expect(avatar?.getAttribute('data-size')).toBe('default');
  });

  it('renders with custom size', () => {
    render(
      <Avatar size='lg'>
        <AvatarFallback>CD</AvatarFallback>
      </Avatar>,
    );
    const avatar = screen.getByText('CD').closest('[data-slot="avatar"]');
    expect(avatar?.getAttribute('data-size')).toBe('lg');
  });

  it('renders avatar with image and fallback', () => {
    render(
      <Avatar>
        <AvatarImage src='/photo.jpg' alt='User' />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('U')).toBeTruthy();
  });
});

describe('Switch', () => {
  it('renders as checkbox role', () => {
    render(<Switch />);
    const el = screen.getByRole('switch');
    expect(el).toBeTruthy();
  });

  it('renders with default size', () => {
    render(<Switch />);
    const el = screen.getByRole('switch');
    expect(el.getAttribute('data-size')).toBe('default');
  });

  it('renders with sm size', () => {
    render(<Switch size='sm' />);
    const el = screen.getByRole('switch');
    expect(el.getAttribute('data-size')).toBe('sm');
  });

  it('renders with default checked state', () => {
    render(<Switch defaultChecked />);
    const el = screen.getByRole('switch');
    expect(el.getAttribute('data-state')).toBe('checked');
  });

  it('renders disabled', () => {
    render(<Switch disabled />);
    const el = screen.getByRole('switch');
    expect(el.hasAttribute('disabled')).toBe(true);
  });
});

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox />);
    const el = screen.getByRole('checkbox');
    expect(el).toBeTruthy();
  });

  it('renders checked by default', () => {
    render(<Checkbox defaultChecked />);
    const el = screen.getByRole('checkbox');
    expect(el.getAttribute('data-state')).toBe('checked');
  });

  it('renders disabled', () => {
    render(<Checkbox disabled />);
    const el = screen.getByRole('checkbox');
    expect(el.hasAttribute('disabled')).toBe(true);
  });
});
