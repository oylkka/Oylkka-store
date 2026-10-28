import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import {
  ArrowLeft,
  ImageIcon,
  MessageSquare,
  Paperclip,
  Search,
  SendHorizontal,
  X,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  useConversationRealtime,
  useConversations,
  useMessages,
  useSendMessageMutation,
} from '@/services/conversations';
import type { ConversationListItem, MessageView } from '@/types/messaging';

export const Route = createFileRoute('/messages/')({
  // Messaging is only for signed-in users (customers and vendors)
  beforeLoad: ({ context }) => {
    if (!context.user) {
      // TODO: use your real sign-in route
      throw redirect({ to: '/auth/signin' });
    }
  },
  validateSearch: (
    search: Record<string, unknown>,
  ): { conversation?: string } => ({
    conversation:
      typeof search.conversation === 'string' && search.conversation
        ? search.conversation
        : undefined,
  }),
  component: RouteComponent,
});

const MAX_IMAGE_BYTES = 1024 * 1024; // keep in sync with the server limit (1 MB)
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

const timeFormat = new Intl.DateTimeFormat([], {
  hour: 'numeric',
  minute: '2-digit',
});
const dayFormat = new Intl.DateTimeFormat([], {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
});
const shortDayFormat = new Intl.DateTimeFormat([], {
  month: 'short',
  day: 'numeric',
});

const dayKey = (iso: string) => new Date(iso).toDateString();

function listTime(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString()
    ? timeFormat.format(d)
    : shortDayFormat.format(d);
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return dayFormat.format(d);
}

const previewOf = (c: ConversationListItem) =>
  c.lastMessage ? c.lastMessage.content || 'Sent a photo' : 'No messages yet';

// A row is unread only when the last message is from the other party and not read
const isUnread = (c: ConversationListItem, userId?: string) =>
  !!c.lastMessage && c.lastMessage.senderId !== userId && !c.lastMessage.isRead;

function Person({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback className='bg-primary/10 font-medium text-primary'>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

/* -------------------------------------------------------------------------- */
/*  Route                                                                     */
/* -------------------------------------------------------------------------- */

function RouteComponent() {
  // beforeLoad guarantees a signed-in user, so context.user is set here
  const { user } = Route.useRouteContext();
  const userId = user?.id;

  const { conversation: activeId } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const conversationsQuery = useConversations();
  const conversations = conversationsQuery.data?.conversations ?? [];
  const active = conversations.find((c) => c.id === activeId);

  const { status } = useConversationRealtime({
    userId,
    activeConversationId: activeId,
  });

  const [query, setQuery] = React.useState('');
  const visible = conversations.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.counterpart.name.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q)
    );
  });

  const select = (id: string) => navigate({ search: { conversation: id } });
  const back = () => navigate({ search: { conversation: undefined } });

  return (
    <div className='flex h-dvh flex-col bg-muted/40'>
      <Header />

      <main className='mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col p-0 md:p-6'>
        {status === 'unavailable' && (
          <p className='bg-muted px-4 py-2 text-center text-xs text-muted-foreground md:mb-3 md:rounded-lg'>
            Live updates are unavailable. You can still send messages; refresh
            to see new replies.
          </p>
        )}

        <div className='flex min-h-0 flex-1 overflow-hidden border-t bg-background md:rounded-2xl md:border md:shadow-sm'>
          {/* Inbox */}
          <aside
            className={cn(
              'w-full flex-col border-r md:flex md:w-80 lg:w-96',
              activeId ? 'hidden' : 'flex',
            )}
          >
            <div className='space-y-3 p-4'>
              <h1 className='text-xl font-semibold tracking-tight'>Messages</h1>
              <div className='relative'>
                <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search conversations'
                  className='rounded-full bg-muted/50 pl-9'
                />
              </div>
            </div>

            <div className='flex-1 overflow-y-auto px-2 pb-2'>
              {conversationsQuery.isLoading && <InboxSkeleton />}

              {conversationsQuery.isError && (
                <div className='space-y-3 px-4 py-10 text-center text-sm text-muted-foreground'>
                  <p>We could not load your messages.</p>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => conversationsQuery.refetch()}
                  >
                    Try again
                  </Button>
                </div>
              )}

              {conversationsQuery.isSuccess && conversations.length === 0 && (
                <p className='px-4 py-10 text-center text-sm text-muted-foreground'>
                  No conversations yet. Message a store from a product or order
                  page to start one.
                </p>
              )}

              {conversationsQuery.isSuccess &&
                conversations.length > 0 &&
                visible.length === 0 && (
                  <p className='px-4 py-10 text-center text-sm text-muted-foreground'>
                    No conversations match your search.
                  </p>
                )}

              <ul className='space-y-1'>
                {visible.map((c) => (
                  <li key={c.id}>
                    <ConversationRow
                      conversation={c}
                      unread={isUnread(c, userId)}
                      selected={c.id === activeId}
                      onSelect={() => select(c.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Thread */}
          <section
            className={cn(
              'min-w-0 flex-1 flex-col',
              activeId ? 'flex' : 'hidden md:flex',
            )}
          >
            {!activeId && (
              <CenterNote
                icon={<MessageSquare className='size-6' />}
                title='Select a conversation'
              >
                Choose a store from the list to read and reply.
              </CenterNote>
            )}

            {activeId && conversationsQuery.isLoading && <ThreadSkeleton />}

            {activeId && conversationsQuery.isSuccess && !active && (
              <CenterNote title='Conversation not found'>
                It may have been removed, or you may not have access to it.
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-4'
                  onClick={back}
                >
                  Back to messages
                </Button>
              </CenterNote>
            )}

            {active && (
              <Thread
                key={active.id}
                conversation={active}
                userId={userId}
                onBack={back}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Inbox                                                                     */
/* -------------------------------------------------------------------------- */

function ConversationRow({
  conversation: c,
  unread,
  selected,
  onSelect,
}: {
  conversation: ConversationListItem;
  unread: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'bg-primary/5 ring-1 ring-primary/20',
      )}
    >
      <Person
        name={c.counterpart.name}
        imageUrl={c.counterpart.imageUrl}
        className='size-11'
      />
      <div className='min-w-0 flex-1'>
        <div className='flex items-baseline justify-between gap-2'>
          <p
            className={cn(
              'truncate text-sm',
              unread ? 'font-semibold' : 'font-medium',
            )}
          >
            {c.counterpart.name}
          </p>
          <span className='shrink-0 text-xs text-muted-foreground'>
            {listTime(c.lastMessageAt)}
          </span>
        </div>
        <p className='truncate text-xs text-muted-foreground'>{c.subject}</p>
        <div className='flex items-center justify-between gap-2'>
          <p
            className={cn(
              'truncate text-sm',
              unread ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {previewOf(c)}
          </p>
          {unread && (
            <span className='size-2.5 shrink-0 rounded-full bg-primary' />
          )}
        </div>
        {(c.order || c.product) && (
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
            {c.order ? `Order ${c.order.orderNumber}` : c.product?.productName}
          </p>
        )}
      </div>
    </button>
  );
}

function InboxSkeleton() {
  return (
    <div className='space-y-1'>
      {Array.from({ length: 5 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
        <div key={i} className='flex items-center gap-3 p-3'>
          <Skeleton className='size-11 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-3.5 w-1/2' />
            <Skeleton className='h-3 w-3/4' />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Thread                                                                    */
/* -------------------------------------------------------------------------- */

function Thread({
  conversation: c,
  userId,
  onBack,
}: {
  conversation: ConversationListItem;
  userId?: string;
  onBack: () => void;
}) {
  const messagesQuery = useMessages(c.id);
  // Assumes the hook returns the API shape `{ messages }`; use `data ?? []` if yours unwraps it
  const messages: MessageView[] = messagesQuery.data?.messages ?? [];
  const closed = c.status === 'CLOSED';

  return (
    <>
      <header className='flex items-center gap-3 border-b px-4 py-3'>
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden'
          onClick={onBack}
          aria-label='Back to conversations'
        >
          <ArrowLeft />
        </Button>
        <Person
          name={c.counterpart.name}
          imageUrl={c.counterpart.imageUrl}
          className='size-10'
        />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold'>{c.counterpart.name}</p>
          <p className='truncate text-xs text-muted-foreground'>{c.subject}</p>
        </div>
        {closed && <Badge variant='secondary'>Closed</Badge>}
      </header>

      <ContextStrip conversation={c} />

      {messagesQuery.isLoading && <ThreadSkeleton />}

      {messagesQuery.isError && (
        <CenterNote title='We could not load this conversation'>
          <Button
            variant='outline'
            size='sm'
            className='mt-4'
            onClick={() => messagesQuery.refetch()}
          >
            Try again
          </Button>
        </CenterNote>
      )}

      {messagesQuery.isSuccess && (
        // Mounted only once messages exist so the scroller opens at the latest message
        <MessageScrollerProvider
          key={c.id}
          autoScroll
          defaultScrollPosition='end'
        >
          <MessageScroller className='min-h-0 flex-1'>
            <MessageScrollerViewport>
              <MessageScrollerContent className='gap-2 p-4 md:px-6'>
                {messages.length === 0 && (
                  <MessageScrollerItem messageId='empty'>
                    <p className='py-10 text-center text-sm text-muted-foreground'>
                      No messages yet. Say hello to {c.counterpart.name}.
                    </p>
                  </MessageScrollerItem>
                )}

                {messages.map((m, i) => {
                  const prev = messages[i - 1];
                  const next = messages[i + 1];
                  const mine = m.senderId === userId;
                  const newDay =
                    !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
                  const lastInGroup =
                    !next ||
                    next.senderId !== m.senderId ||
                    dayKey(next.createdAt) !== dayKey(m.createdAt);

                  return (
                    <React.Fragment key={m.id}>
                      {newDay && (
                        <MessageScrollerItem
                          messageId={`day-${dayKey(m.createdAt)}`}
                        >
                          <Marker variant='separator'>
                            <MarkerContent>
                              {dayLabel(m.createdAt)}
                            </MarkerContent>
                          </Marker>
                        </MessageScrollerItem>
                      )}
                      <MessageScrollerItem messageId={m.id}>
                        <Message align={mine ? 'end' : 'start'}>
                          {!mine && (
                            <MessageAvatar>
                              {lastInGroup && (
                                <Person
                                  name={c.counterpart.name}
                                  imageUrl={c.counterpart.imageUrl}
                                  className='size-8'
                                />
                              )}
                            </MessageAvatar>
                          )}
                          <MessageContent>
                            <Bubble variant={mine ? 'default' : 'secondary'}>
                              <BubbleContent className='space-y-2'>
                                {m.imageUrl && (
                                  <a
                                    href={m.imageUrl}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='block'
                                  >
                                    <img
                                      src={m.imageUrl}
                                      alt='Attached assets'
                                      className='max-h-64 rounded-lg object-cover'
                                    />
                                  </a>
                                )}
                                {m.content && (
                                  <p className='whitespace-pre-wrap wrap-break-word'>
                                    {m.content}
                                  </p>
                                )}
                              </BubbleContent>
                            </Bubble>
                            {lastInGroup && (
                              <MessageFooter>
                                {timeFormat.format(new Date(m.createdAt))}
                              </MessageFooter>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    </React.Fragment>
                  );
                })}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      <Composer conversationId={c.id} closed={closed} />
    </>
  );
}

function ContextStrip({
  conversation: c,
}: {
  conversation: ConversationListItem;
}) {
  if (!c.product && !c.order) return null;
  const customer = c.viewerRole === 'customer';

  return (
    <div className='flex items-center gap-3 border-b bg-muted/30 px-4 py-2.5'>
      {c.product ? (
        <>
          <Avatar className='size-9 rounded-lg'>
            {c.product.imageUrl && (
              <AvatarImage
                src={c.product.imageUrl}
                alt=''
                className='rounded-lg'
              />
            )}
            <AvatarFallback className='rounded-lg bg-primary/10 text-primary'>
              <ImageIcon className='size-4' />
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>
              {c.product.productName}
            </p>
            {c.order && (
              <p className='text-xs text-muted-foreground'>
                Order {c.order.orderNumber}
              </p>
            )}
          </div>
          <Button asChild variant='outline' size='sm'>
            <Link to='/product/$slug' params={{ slug: c.product.slug }}>
              View product
            </Link>
          </Button>
        </>
      ) : (
        c.order && (
          <>
            <p className='min-w-0 flex-1 truncate text-sm font-medium'>
              Order {c.order.orderNumber}
            </p>
            {customer && (
              <Button asChild variant='outline' size='sm'>
                <Link
                  to='/dashboard/orders/$orderId'
                  params={{ orderId: c.order.id }}
                >
                  View order
                </Link>
              </Button>
            )}
          </>
        )
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Composer                                                                  */
/* -------------------------------------------------------------------------- */

function Composer({
  conversationId,
  closed,
}: {
  conversationId: string;
  closed: boolean;
}) {
  const send = useSendMessageMutation();
  const [text, setText] = React.useState('');
  const [image, setImage] = React.useState<File | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const preview = React.useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  );
  React.useEffect(
    () => () => (preview ? URL.revokeObjectURL(preview) : undefined),
    [preview],
  );

  const canSend = (text.trim().length > 0 || !!image) && !send.isPending;

  const pick = (file?: File) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type))
      return toast.error('Use a JPEG, PNG, WebP or GIF image');
    if (file.size > MAX_IMAGE_BYTES)
      return toast.error('Image must be under 1MB');
    setImage(file);
  };

  const submit = () => {
    if (!canSend) return;
    const form = new FormData();
    form.append('conversationId', conversationId);
    form.append('content', text.trim());
    if (image) form.append('image', image);

    send.mutate(form, {
      onSuccess: () => {
        setText('');
        setImage(null);
        if (fileRef.current) fileRef.current.value = '';
      },
    });
  };

  if (closed) {
    return (
      <p className='border-t bg-muted/30 p-4 text-center text-sm text-muted-foreground'>
        This conversation is closed. You can still read it, but you can no
        longer reply.
      </p>
    );
  }

  return (
    <div className='border-t p-3 md:p-4'>
      {preview && (
        <div className='relative mb-3 w-fit'>
          <img
            src={preview}
            alt='Selected attachment'
            className='h-20 rounded-lg border object-cover'
          />
          <Button
            variant='secondary'
            size='icon'
            className='absolute -right-2 -top-2 size-6 rounded-full'
            onClick={() => {
              setImage(null);
              if (fileRef.current) fileRef.current.value = '';
            }}
            aria-label='Remove photo'
          >
            <X className='size-3.5' />
          </Button>
        </div>
      )}

      <div className='flex items-end gap-2'>
        <input
          ref={fileRef}
          type='file'
          accept={IMAGE_TYPES.join(',')}
          className='hidden'
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full'
          onClick={() => fileRef.current?.click()}
          aria-label='Attach a photo'
        >
          <Paperclip />
        </Button>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder='Write a message'
          className='max-h-32 min-h-10 resize-none rounded-2xl bg-muted/50 px-4 py-2'
        />
        <Button
          size='icon'
          className='rounded-full'
          onClick={submit}
          disabled={!canSend}
          aria-label='Send message'
        >
          <SendHorizontal />
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small states                                                              */
/* -------------------------------------------------------------------------- */

function ThreadSkeleton() {
  return (
    <div className='flex flex-1 flex-col justify-end gap-3 p-6'>
      <Skeleton className='h-10 w-2/5 rounded-2xl' />
      <Skeleton className='ml-auto h-10 w-1/3 rounded-2xl' />
      <Skeleton className='h-16 w-1/2 rounded-2xl' />
    </div>
  );
}

function CenterNote({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center'>
      {icon && (
        <div className='grid size-12 place-items-center rounded-full bg-primary/10 text-primary'>
          {icon}
        </div>
      )}
      <p className='font-medium'>{title}</p>
      <div className='max-w-xs text-sm text-muted-foreground'>{children}</div>
    </div>
  );
}
