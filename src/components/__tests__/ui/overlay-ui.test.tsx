import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

describe('Dialog', () => {
  it('renders trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Modal</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText('Open')).toBeTruthy();
  });
});

describe('Popover', () => {
  it('renders trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Click</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText('Click')).toBeTruthy();
  });
});

describe('Select', () => {
  it('renders trigger with placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder='Pick one' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='a'>Option A</SelectItem>
          <SelectItem value='b'>Option B</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByText('Pick one')).toBeTruthy();
  });
});

describe('Field', () => {
  it('renders label and description', () => {
    render(
      <FieldGroup>
        <FieldLabel>Email</FieldLabel>
        <FieldDescription>Enter your email</FieldDescription>
      </FieldGroup>,
    );
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Enter your email')).toBeTruthy();
  });

  it('renders with error', () => {
    render(
      <FieldGroup>
        <FieldLabel>Name</FieldLabel>
        <FieldError>This field is required</FieldError>
      </FieldGroup>,
    );
    expect(screen.getByText('This field is required')).toBeTruthy();
  });
});

describe('InputGroup', () => {
  it('renders with addon text', () => {
    render(
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <input />
      </InputGroup>,
    );
    expect(screen.getByText('$')).toBeTruthy();
  });
});
