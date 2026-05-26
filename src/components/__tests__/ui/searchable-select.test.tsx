import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { SearchableSelect } from '@/components/ui/searchable-select';

const options = ['Option A', 'Option B', 'Option C'];

describe('SearchableSelect', () => {
  it('renders with placeholder text', () => {
    render(
      <SearchableSelect
        options={options}
        value=''
        onChange={() => {}}
        placeholder='Select an option...'
      />,
    );
    expect(screen.getByText('Select an option...')).toBeTruthy();
  });

  it('shows selected value', () => {
    render(
      <SearchableSelect
        options={options}
        value='Option B'
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Option B')).toBeTruthy();
  });

  it('renders with disabled state', () => {
    render(
      <SearchableSelect
        options={options}
        value=''
        onChange={() => {}}
        disabled
      />,
    );
    const button = screen.getByRole('combobox');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('renders the combobox with correct aria attributes', () => {
    render(<SearchableSelect options={options} value='' onChange={() => {}} />);
    const button = screen.getByRole('combobox');
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });
});
