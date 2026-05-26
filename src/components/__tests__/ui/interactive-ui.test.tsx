import { describe, expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

describe('Accordion', () => {
  it('renders items with triggers', () => {
    render(
      <Accordion type='single'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText('Section 1')).toBeTruthy();
    expect(screen.getByText('Section 2')).toBeTruthy();
  });

  it('renders with default value', () => {
    render(
      <Accordion type='single' defaultValue='item-1'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Open</AccordionTrigger>
          <AccordionContent>Visible</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText('Open')).toBeTruthy();
  });
});

describe('Collapsible', () => {
  it('renders trigger with content', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Details</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText('Toggle')).toBeTruthy();
  });

  it('renders open by default', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Hide</CollapsibleTrigger>
        <CollapsibleContent>Shown</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText('Hide')).toBeTruthy();
    expect(screen.getByText('Shown')).toBeTruthy();
  });
});

describe('Tabs', () => {
  it('renders triggers', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab One</TabsTrigger>
          <TabsTrigger value='tab2'>Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText('Tab One')).toBeTruthy();
    expect(screen.getByText('Tab Two')).toBeTruthy();
  });

  it('shows default tab content', () => {
    render(
      <Tabs defaultValue='tab2'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Hidden</TabsContent>
        <TabsContent value='tab2'>Active</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText('Active')).toBeTruthy();
  });
});

describe('ScrollArea', () => {
  it('renders children', () => {
    render(
      <ScrollArea>
        <p>Scrollable</p>
      </ScrollArea>,
    );
    expect(screen.getByText('Scrollable')).toBeTruthy();
  });
});

describe('Tooltip', () => {
  it('renders trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText('Hover me')).toBeTruthy();
  });
});
