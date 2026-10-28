import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowLeft,
  Package,
  Paperclip,
  Search,
  SendHorizontal,
} from 'lucide-react';
import * as React from 'react';
import Header from '@/components/layout/header';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Marker, MarkerContent } from '@/components/ui/marker';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from '@/components/ui/message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/messages/')({
  component: RouteComponent,
});

type ChatMessage = {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
};
type Conversation = {
  id: string;
  name: string;
  online: boolean;
  unread: number;
  order: { number: string; item: string; status: string };
  messages: ChatMessage[];
};

const INITIAL: Conversation[] = [
  {
    id: '1',
    name: 'Nordkaffe Roasters',
    online: true,
    unread: 2,
    order: {
      number: '#4821',
      item: 'Yirgacheffe Whole Beans, 1 kg',
      status: 'Shipped',
    },
    messages: [
      {
        id: 'a',
        from: 'me',
        text: 'Hi! Could you roast the beans a little lighter? I mostly brew filter.',
        time: '4:12 PM',
      },
      {
        id: 'b',
        from: 'them',
        text: 'Of course, I have noted it on your order. We will go for a light-medium roast.',
        time: '4:30 PM',
      },
      {
        id: 'c',
        from: 'them',
        text: 'Good news, your order shipped this morning!',
        time: '9:05 AM',
      },
      {
        id: 'd',
        from: 'them',
        text: 'You can follow it with the tracking link on your order page.',
        time: '9:05 AM',
      },
    ],
  },
  {
    id: '2',
    name: 'Loom & Linen',
    online: false,
    unread: 0,
    order: {
      number: '#4790',
      item: 'Linen Duvet Cover, Queen',
      status: 'Packed',
    },
    messages: [
      {
        id: 'a',
        from: 'me',
        text: 'Does the queen size fit a 90 x 100 inch insert?',
        time: '11:20 AM',
      },
      {
        id: 'b',
        from: 'them',
        text: 'It will be snug. I suggest the king size for that insert.',
        time: '1:48 PM',
      },
    ],
  },
  {
    id: '3',
    name: 'Atelier Mono',
    online: true,
    unread: 0,
    order: {
      number: '#4755',
      item: 'Leather Card Holder, Tan',
      status: 'Delivered',
    },
    messages: [
      {
        id: 'a',
        from: 'me',
        text: 'The engraving looks great, thank you!',
        time: '10:02 AM',
      },
      {
        id: 'b',
        from: 'them',
        text: 'So glad you like it! Enjoy.',
        time: '10:40 AM',
      },
    ],
  },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');

function Person({
  name,
  online,
  className,
}: {
  name: string;
  online?: boolean;
  className?: string;
}) {
  return (
    <div className='relative shrink-0'>
      <Avatar className={className}>
        <AvatarFallback className='bg-primary/10 font-medium text-primary'>
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      {online && (
        <span className='absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-primary' />
      )}
    </div>
  );
}

function RouteComponent() {
  const [convos, setConvos] = React.useState(INITIAL);
  const [activeId, setActiveId] = React.useState(INITIAL[0].id);
  const [showThread, setShowThread] = React.useState(false); // mobile only
  const [query, setQuery] = React.useState('');
  const [text, setText] = React.useState('');

  // biome-ignore lint/style/noNonNullAssertion: this is fine
  const active = convos.find((c) => c.id === activeId)!;
  const visible = convos.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  const open = (id: string) => {
    setActiveId(id);
    setShowThread(true);
    setConvos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  };

  const send = () => {
    const value = text.trim();
    if (!value) return;
    const time = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    setConvos((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: crypto.randomUUID(), from: 'me', text: value, time },
              ],
            }
          : c,
      ),
    );
    setText('');
  };

  return (
    <div className='flex h-dvh flex-col bg-muted/40'>
      <Header />

      <main className='mx-auto flex min-h-0 w-full max-w-6xl flex-1 p-0 md:p-6'>
        <div className='flex min-h-0 flex-1 overflow-hidden border-t md:my-4 bg-background md:rounded-2xl md:border md:shadow-sm'>
          {/* Conversation list */}
          <aside
            className={cn(
              'w-full flex-col border-r md:flex md:w-80 lg:w-96',
              showThread ? 'hidden' : 'flex',
            )}
          >
            <div className='space-y-3 p-4'>
              <h1 className='text-xl font-semibold tracking-tight'>Messages</h1>
              <div className='relative'>
                <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search stores'
                  className='rounded-full bg-muted/50 pl-9'
                />
              </div>
            </div>

            <ul className='flex-1 space-y-1 overflow-y-auto px-2 pb-2'>
              {visible.length === 0 && (
                <li className='px-4 py-10 text-center text-sm text-muted-foreground'>
                  No stores match your search.
                </li>
              )}
              {visible.map((c) => {
                const last = c.messages[c.messages.length - 1];
                return (
                  <li key={c.id}>
                    <button
                      type='button'
                      onClick={() => open(c.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        c.id === activeId &&
                          'bg-primary/5 ring-1 ring-primary/20',
                      )}
                    >
                      <Person
                        name={c.name}
                        online={c.online}
                        className='size-11'
                      />
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-baseline justify-between gap-2'>
                          <p
                            className={cn(
                              'truncate text-sm',
                              c.unread ? 'font-semibold' : 'font-medium',
                            )}
                          >
                            {c.name}
                          </p>
                          <span className='shrink-0 text-xs text-muted-foreground'>
                            {last.time}
                          </span>
                        </div>
                        <div className='flex items-center justify-between gap-2'>
                          <p
                            className={cn(
                              'truncate text-sm',
                              c.unread
                                ? 'text-foreground'
                                : 'text-muted-foreground',
                            )}
                          >
                            {last.from === 'me' && 'You: '}
                            {last.text}
                          </p>
                          {c.unread > 0 && (
                            <Badge className='h-5 min-w-5 shrink-0 rounded-full px-1.5'>
                              {c.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Thread */}
          <section
            className={cn(
              'min-w-0 flex-1 flex-col',
              showThread ? 'flex' : 'hidden md:flex',
            )}
          >
            <header className='flex items-center gap-3 border-b px-4 py-3'>
              <Button
                variant='ghost'
                size='icon'
                className='md:hidden'
                onClick={() => setShowThread(false)}
                aria-label='Back to conversations'
              >
                <ArrowLeft />
              </Button>
              <Person
                name={active.name}
                online={active.online}
                className='size-10'
              />
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold'>{active.name}</p>
                <p className='text-xs text-muted-foreground'>
                  {active.online ? 'Online now' : 'Offline'}
                </p>
              </div>
            </header>

            {/* Order context */}
            <div className='flex items-center gap-3 border-b bg-muted/30 px-4 py-2.5'>
              <div className='grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'>
                <Package className='size-5' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>
                  {active.order.item}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Order {active.order.number}
                </p>
              </div>
              <Badge variant='secondary'>{active.order.status}</Badge>
              <Button
                variant='outline'
                size='sm'
                className='hidden sm:inline-flex'
              >
                View order
              </Button>
            </div>

            {/* key resets scroll position when switching conversations */}
            <MessageScrollerProvider
              key={active.id}
              autoScroll
              defaultScrollPosition='end'
            >
              <MessageScroller className='min-h-0 flex-1'>
                <MessageScrollerViewport>
                  <MessageScrollerContent className='gap-2 p-4 md:px-6'>
                    <MessageScrollerItem messageId='today'>
                      <Marker variant='separator'>
                        <MarkerContent>Today</MarkerContent>
                      </Marker>
                    </MessageScrollerItem>

                    {active.messages.map((m, i) => {
                      const mine = m.from === 'me';
                      const next = active.messages[i + 1];
                      const lastInGroup = !next || next.from !== m.from;
                      return (
                        <MessageScrollerItem key={m.id} messageId={m.id}>
                          <Message align={mine ? 'end' : 'start'}>
                            {!mine && (
                              <MessageAvatar>
                                {lastInGroup && (
                                  <Avatar className='size-8'>
                                    <AvatarFallback className='bg-primary/10 text-xs font-medium text-primary'>
                                      {initials(active.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </MessageAvatar>
                            )}
                            <MessageContent>
                              <Bubble variant={mine ? 'default' : 'secondary'}>
                                <BubbleContent>{m.text}</BubbleContent>
                              </Bubble>
                              {lastInGroup && (
                                <MessageFooter>{m.time}</MessageFooter>
                              )}
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                      );
                    })}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>

            <div className='flex items-center gap-2 border-t p-3 md:p-4'>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full'
                aria-label='Attach a file'
              >
                <Paperclip />
              </Button>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder='Write a message'
                className='h-10 rounded-full bg-muted/50 px-4'
              />
              <Button
                size='icon'
                className='rounded-full'
                onClick={send}
                disabled={!text.trim()}
                aria-label='Send message'
              >
                <SendHorizontal />
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
