import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

describe('Table', () => {
  it('renders table structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>$10</TableCell>
          </TableRow>
        </TableBody>
        <TableCaption>Products</TableCaption>
      </Table>,
    );
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Item')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
  });

  it('renders with custom className on table', () => {
    const { container } = render(
      <Table className='custom'>
        <TableBody>
          <TableRow>
            <TableCell>Test</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = container.querySelector('[data-slot="table"]');
    expect(table?.classList.contains('custom')).toBe(true);
  });
});

describe('Alert', () => {
  it('renders with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something happened</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText('Heads up')).toBeTruthy();
    expect(screen.getByText('Something happened')).toBeTruthy();
  });

  it('renders with default role', () => {
    render(
      <Alert>
        <AlertTitle>Info</AlertTitle>
      </Alert>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
  });

  it('renders with destructive variant class', () => {
    render(
      <Alert variant='destructive'>
        <AlertTitle>Error</AlertTitle>
      </Alert>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
  });
});

describe('Breadcrumb', () => {
  it('renders breadcrumb items', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href='/'>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href='/products'>Products</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
  });

  it('renders links with correct href', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    const link = screen.getByText('Dashboard');
    expect(link.getAttribute('href')).toBe('/dashboard');
  });
});
