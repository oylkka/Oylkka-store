# Messaging System — Implementation Plan

Status: **Ready for review (revised)**

Scope: customer ↔ vendor conversations in `/messages`, with real-time delivery through Ably.

The database remains the source of truth. Ably is delivery only: every message is committed to Postgres before an event is published.

Revision notes:

- All messaging endpoints will be nested under `/api/chat/`.
- `createServerFn` was evaluated; Phase 3 keeps REST route handlers so the `/api/chat/` namespace stays isolated.
- The shared message-image limit will be 1 MB.

---

## 1. Decisions

| Decision              | Choice                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| Schema models         | Reuse existing `Conversation` and `Message`; no new models                          |
| Image-only messages   | Keep `Message.content` required; store `content: ''` when only an image is sent     |
| Thread model          | Reuse one OPEN thread per customer + shop + order/product context                   |
| Participants          | Customer and vendor (`Shop.ownerId`) only                                           |
| Read state            | Keep the single `Message.isRead` flag; it means “read by the other party”           |
| Email notifications   | Not in v1                                                                           |
| Admin/staff messaging | Not in v1; existing admin endpoints stay untouched                                  |
| Real-time             | Ably `user:<userId>` channels, server-side publish, subscribe-only client tokens    |
| API surface           | Every messaging API lives under `/api/chat/`                                        |
| Transport             | REST route handlers; server functions are not used for this feature (see Section 4) |
| Message image limit   | 1 MB                                                                                |
| Typing/presence       | Not in v1                                                                           |

### Existing state

The previous messaging feature was removed in commit `53da7d2`, but parts of it remain:

- Existing schema: `prisma/conversation.prisma`
- Existing vendor APIs: `src/routes/api/vendor/conversations/*`
- Existing admin APIs: `src/routes/api/admin/conversations/*`, `src/routes/api/admin/messages/create.ts`
- Existing image upload: `src/lib/message-upload.ts`, `src/routes/api/upload/message.ts`
- Deleted and recoverable from `53da7d2^`: customer conversation/message APIs, `src/services/conversations.ts`, dashboard message pages

Currently broken entry points:

- `src/routes/product.$slug.tsx` posts to the old missing `/api/conversations/create`; Phase 6 moves it to `/api/chat/conversations/create`
- `src/routes/dashboard/orders/$orderId.tsx` posts to the same old missing endpoint
- The product page navigates to `/messages` with an `id` param, but the current route accepts no params

---

## 2. Schema Plan

### 2.1 Model changes

**None.** The existing `Conversation` and `Message` fields are sufficient.

Confirmed mapping:

| Requirement     | Field                                       |
| --------------- | ------------------------------------------- |
| Customer        | `Conversation.customerId`                   |
| Vendor          | `Conversation.shopId` → `Shop.ownerId`      |
| Product context | `Conversation.productId`                    |
| Order context   | `Conversation.orderId`                      |
| Subject         | `Conversation.subject`                      |
| Status          | `Conversation.status` (`OPEN` / `CLOSED`)   |
| Inbox ordering  | `Conversation.lastMessageAt`                |
| Text            | `Message.content`                           |
| Image           | `Message.imageUrl`, `Message.imagePublicId` |
| Sender          | `Message.senderId`                          |
| Read state      | `Message.isRead`                            |

### 2.2 Index-only migration

Replace redundant single-column indexes with composite indexes.

```prisma
model Conversation {
  // ...existing fields

  @@index([customerId, lastMessageAt])
  @@index([shopId, lastMessageAt])
  @@index([status])
  @@map("conversations")
}

model Message {
  // ...existing fields

  @@index([conversationId, createdAt])
  @@index([senderId])
  @@map("messages")
}
```

This removes:

- `@@index([customerId])`
- `@@index([shopId])`
- `@@index([conversationId])`

The composite indexes cover those lookups as their leading column.

Migration command:

```bash
bunx prisma migrate dev --name add_messaging_indexes
```

No data migration and no destructive column changes.

### 2.3 Read-state invariant

- Every new message starts with `isRead = false`.
- When the customer opens a thread, mark messages where `senderId !== conversation.customerId` as read.
- When the vendor opens a thread, mark messages where `senderId !== conversation.shop.ownerId` as read.
- An inbox row is unread only when its last message is from the other party and `isRead = false`.
- Own sent messages must never make the thread look unread.

### 2.4 Thread reuse invariant

Find an existing thread with:

```ts
{
  customerId,
  shopId,
  status: 'OPEN',
  orderId: orderId ?? null,
  productId: productId ?? null,
}
```

If found, append the new message and update `lastMessageAt`.

If only a CLOSED thread matches, create a new OPEN thread. Do not reopen closed history.

No database unique constraint is added because `orderId` and `productId` are nullable and different contexts intentionally produce different threads. Two simultaneous first-message requests may create duplicate threads; this is accepted for v1 and can be tightened later.

---

## 3. Ably Design

### 3.1 Channels

Each authenticated user subscribes to:

```text
user:<userId>
```

The server publishes message events to both participants’ user channels.

No browser-side publish. The browser token grants `subscribe` only.

### 3.2 Token endpoint

`GET /api/chat/ably/token`

- Requires an authenticated session.
- Returns an Ably token request with:
  - `clientId` = session user ID
  - capability `{ "user:<userId>": ["subscribe"] }`
  - short TTL, renewed automatically by the Ably client
- Returns `401` when unauthenticated.
- Returns `503` when Ably is not configured.

### 3.3 Event payload

```ts
type MessageCreatedEvent = {
  type: "message.created";
  conversationId: string;
  message: {
    id: string;
    senderId: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
    isRead: boolean;
  };
};
```

### 3.4 Delivery flow

```text
DB transaction:
  create message
  update conversation.lastMessageAt
        ↓
publish to user:<customerId> and user:<shop.ownerId>
        ↓
client receives event
        ↓
merge message into React Query cache by message.id
        ↓
invalidate inbox queries
```

Rules:

- Publish only after the database commit succeeds.
- A publish failure must not fail the send response.
- Log publish failures with `logError`.
- The sender receives their own event; the client deduplicates by `message.id`.
- If Ably is unconfigured, messages still save and the UI can refetch.

### 3.5 Environment

Add to `.env`:

```bash
ABLY_API_KEY=""
```

Add the same placeholder to `.env.example` and document it in `README.md`.

Add `ably` to `package.json`. It is present in `node_modules` but not currently declared as a dependency.

---

## 4. API Plan

Every messaging endpoint lives under `/api/chat/` so the feature has one clear API namespace. Reuse the repository’s existing `/create` and `/list` route style inside that namespace.

| Method | Endpoint                                  | Access             | Purpose                                           |
| ------ | ----------------------------------------- | ------------------ | ------------------------------------------------- |
| POST   | `/api/chat/conversations/create`          | Customer           | Start or reuse a thread and add the first message |
| GET    | `/api/chat/conversations/list`            | Customer or vendor | Inbox for the current user                        |
| GET    | `/api/chat/conversations/unread`          | Customer or vendor | Unread badge count                                |
| GET    | `/api/chat/conversations/$conversationId` | Participant        | Conversation detail                               |
| PATCH  | `/api/chat/conversations/$conversationId` | Participant        | `read` and `close` actions                        |
| GET    | `/api/chat/messages/list?conversationId=` | Participant        | Message history                                   |
| POST   | `/api/chat/messages/create`               | Participant        | Send text and/or image                            |
| GET    | `/api/chat/ably/token`                    | Authenticated      | Ably token request                                |

Image upload is part of `POST /api/chat/messages/create`; no separate chat upload endpoint is needed. The existing `/api/upload/message` route stays for legacy callers outside this flow, but the new messaging UI does not call it.

### Transport decision: route handlers, not server functions

`createServerFn` was evaluated for this phase. It can carry a POST `FormData` body (including the image), and its handlers can call `requireAuth`, `validateCsrf`, `checkRateLimit`, and the Ably publish helper. The blocker is namespace ownership:

- TanStack Start mounts every server function under one global `serverFns.base`, which defaults to `/_serverFn`. There is no per-function or per-feature base path.
- Setting that global base to something under `/api/chat/` would also move the existing `getSession`, `signOut`, `checkSlugUnique`, and `getPublicProductMeta` server functions. That mixes unrelated APIs into the chat namespace.
- The repository’s data layer is built around `apiClient` + TanStack Query against named API routes. Keeping the messaging routes in that pattern preserves explicit HTTP statuses (`201`, `403`, `409`, `429`) and the existing service/hook structure.

Therefore Phase 3 uses REST route handlers under `/api/chat/`. Server functions remain a valid choice only if the whole application accepts a single `/_serverFn` namespace instead of the requested `/api/chat/` namespace.

### 4.1 Create conversation

Request body:

```ts
{
  shopId: string;
  subject: string;
  message: string;
  productId?: string | null;
  orderId?: string | null;
}
```

Validation:

- Authenticated user acting as the customer; no staff override.
- Shop exists and is `ACTIVE`.
- The acting customer is not the shop owner.
- `productId`, when present, belongs to the shop.
- `orderId`, when present, belongs to the customer and the shop.
- Subject and message are non-empty and bounded.
- Rate limit with `messageLimiter`.
- CSRF validation.

Behavior:

1. Find a matching OPEN thread, newest first if legacy duplicates exist.
2. If found, create the message and update `lastMessageAt` in a transaction. Keep the existing subject.
3. If not found, create the thread and first message in one transaction.
4. Publish `message.created` after commit.
5. Return the conversation and message.

Concurrent first-message requests may create duplicate OPEN threads. This is accepted for v1 per Section 12.

### 4.2 List conversations

Returns threads where the current user is either:

- `conversation.customerId`, or
- `conversation.shop.ownerId`

Include:

- conversation ID, subject, status, `lastMessageAt`
- counterpart display data
- product/order context
- last message preview
- message count
- viewer role (`customer` or `vendor`)

Order by `lastMessageAt` descending, nulls last, then `createdAt` descending.

Return `200 { conversations, unreadCount }`, where `unreadCount` is the total unread counterpart-message count. Per Section 2.3, the row unread indicator is derived from the last message; do not add a per-thread unread count.

### 4.3 Conversation detail

Participant-only.

Return:

- conversation metadata
- counterpart display data
- shop/product/order context
- viewer role

### 4.4 Update conversation

`PATCH` body:

```ts
{ action: 'read' } | { action: 'close' }
```

- `read`: mark counterpart messages as read.
- `close`: set status to `CLOSED`.
- Participant-only.
- CSRF validation.
- Both actions are idempotent and publish no Ably event.

### 4.5 List messages

Query by `conversationId`, participant-only.

- Ascending `createdAt`, then `id`.
- Include sender display fields.
- Never return `imagePublicId`.
- V1 returns the full thread; cursor pagination can be added later using the new `[conversationId, createdAt]` index.

### 4.6 Send message

`multipart/form-data`:

- `conversationId`
- `content` (can be empty when an image is present)
- `image` (optional)

Validation:

- Participant-only.
- Conversation is `OPEN`; a closed thread returns `409`.
- Text or image is present. Trimmed text is limited to 2000 characters.
- Image goes through `uploadMessageImage` (JPEG/PNG/WebP/GIF, max 1 MB).
- Rate limit with `messageLimiter`, keyed by the authenticated user.
- CSRF validation.

Behavior:

1. Upload image if present.
2. Create message and update `lastMessageAt` in a transaction, re-checking `status: 'OPEN'`.
3. Publish `message.created` after commit.
4. Return the message.

If the DB transaction fails after a successful upload, best-effort delete the uploaded image. Do not delete it when only the Ably publish fails.

---

## 5. Server Files

New:

```text
src/lib/ably.ts
src/lib/conversation-access.ts
src/lib/messaging-view.ts
src/routes/api/chat/ably/token.ts
src/routes/api/chat/conversations/create.ts
src/routes/api/chat/conversations/list.ts
src/routes/api/chat/conversations/unread.ts
src/routes/api/chat/conversations/$conversationId.ts
src/routes/api/chat/messages/create.ts
src/routes/api/chat/messages/list.ts
src/types/messaging.ts
```

Changed:

```text
prisma/conversation.prisma
package.json
.env.example
README.md
src/lib/message-upload.ts   # shared message-image limit changes to 1 MB
src/routeTree.gen.ts        # regenerated after adding routes
```

Responsibilities:

- `src/lib/ably.ts`: Ably REST client singleton, configuration check, publish helpers.
- `src/lib/conversation-access.ts`: one authorization helper used by detail, read, close, message list, and send.
- `src/lib/messaging-view.ts`: shared conversation/message DTO selects and mappers, plus the total unread count.
- `src/lib/message-upload.ts`: the single message-image MIME/size validator, shared by `/api/upload/message` and the new send route.
- `src/types/messaging.ts`: shared event, API payload types, and text limits.

Existing admin/vendor endpoints remain untouched in v1 to avoid unrelated churn.

---

## 6. Client Data Layer

New/restored:

```text
src/services/conversations.ts
```

The service calls the `/api/chat/conversations/*` and `/api/chat/messages/*` routes through `apiClient`.

Hooks:

- `useConversations()`
- `useUnreadMessageCount()`
- `useConversationDetail(id)`
- `useMessages(conversationId)`
- `useCreateConversationMutation()`
- `useSendMessageMutation()`
- `useMarkAsReadMutation()`
- `useConversationRealtime({ userId, activeConversationId })`

Realtime behavior:

- Connect using Ably `authCallback` → `/api/chat/ably/token`.
- Subscribe to `user:<userId>`.
- On `message.created`:
  - merge into `[MESSAGES, conversationId]` by `message.id`
  - invalidate the `[CONVERSATIONS]` prefix, which covers the inbox, detail, and unread count
  - if the active thread is open, mark it read
- Disconnect when the messages page unmounts.
- Surface connection failure as a non-blocking “live updates unavailable” hint.

Query keys: reuse `QUERY_KEYS.CONVERSATIONS` and `QUERY_KEYS.MESSAGES` from `src/lib/constants.ts`.

The exact contracts, invalidation rules, and test matrix are in Phase 4 below.

---

## 7. UI Plan

### 7.1 Route

Use one route:

```text
/messages?conversation=<id>
```

Add search validation in `src/routes/messages/index.tsx`:

```ts
{
  conversation?: string
}
```

This fixes the old broken `params: { id }` navigation and keeps the Ably subscription in one place.

### 7.2 Layout

Desktop:

- left: inbox list
- right: selected conversation

Mobile:

- inbox shown first
- conversation replaces the list when selected
- back button returns to the inbox

### 7.3 Inbox row

Customer view:

- shop logo or placeholder
- shop name
- subject
- last message preview
- relative time
- unread dot

Vendor view:

- customer avatar or placeholder
- customer name
- subject
- last message preview
- relative time
- unread dot

Also show product/order context when present.

### 7.4 Conversation pane

- counterpart header and subject
- order/product context
- message bubbles aligned by sender
- image attachments open in a new tab
- per-message time
- “Closed” badge for closed threads
- composer disabled when closed
- image preview with remove action
- Enter sends; Shift+Enter inserts a newline
- loading, error, empty, and not-found states using existing components

### 7.5 Entry-point fixes

`src/routes/product.$slug.tsx`:

- Keep posting to `/api/chat/conversations/create`.
- After success, navigate to `/messages` with `search={{ conversation: conversation.id }}`.

`src/routes/dashboard/orders/$orderId.tsx`:

- Keep posting to `/api/chat/conversations/create`.
- After success, navigate to the new thread or show a success action.

### 7.6 Header unread badge

Not required for v1. The existing header already links to `/messages`.

---

## 8. Security and Reliability Checklist

- [ ] Every conversation read checks customer or shop-owner membership
- [ ] Every message write checks participant membership
- [ ] New conversations reject self-messaging
- [ ] New conversations require an ACTIVE shop
- [ ] Product belongs to the target shop
- [ ] Order belongs to the customer and target shop
- [ ] Closed conversations reject new messages
- [ ] CSRF validation on all mutations
- [ ] `messageLimiter` on create/send
- [ ] Image MIME and size validation through `uploadMessageImage`
- [ ] Message insert and `lastMessageAt` update are transactional
- [ ] Ably publish happens after commit
- [ ] Ably publish failure is logged, not surfaced as a failed send
- [ ] Ably token is subscribe-only and scoped to the current user
- [ ] No Ably API key reaches the browser
- [ ] Own messages never appear as unread

---

## 9. Test Plan

### Automated

Add Bun tests covering:

- [ ] Reusing an OPEN thread for the same context
- [ ] Creating a new thread when no match exists
- [ ] Creating a new thread when the only match is CLOSED
- [ ] Customer can read/send in their own thread
- [ ] Vendor can read/send in their shop’s thread
- [ ] Unrelated user gets `403`
- [ ] Closed thread rejects send
- [ ] Empty text without image is rejected
- [ ] Image-only message is accepted with `content: ''`
- [ ] Image over 1 MB is rejected; image at or under 1 MB is accepted
- [ ] Mark-read updates only counterpart messages
- [ ] Ably publish is called after a successful message create
- [ ] Ably publish failure does not fail the create response

### Commands

```bash
bun run typecheck
bun run check
bun test
```

### Manual

- [ ] Customer sends from a product page
- [ ] Customer sends from an order page
- [ ] Vendor sees the message live without refreshing
- [ ] Vendor replies and the customer sees it live
- [ ] Unread dot appears and clears correctly
- [ ] Image-only message renders correctly
- [ ] Third user receives `403`
- [ ] Closed thread disables the composer
- [ ] Ably disconnect does not break sending

---

## 10. Phase-by-Phase Delivery

Each phase is a review checkpoint.

### Phase 1 — Schema and dependency

Goal: land the index-only migration and the Ably dependency/config placeholders. No application behavior changes.

#### 1.1 Preflight

- [ ] Confirm the working tree contains only the user’s existing changes:
  - `src/components/pages/product/product-questions.tsx`
  - `src/components/pages/product/product-vendor-card.tsx`
  - `src/routes/auth/signup.tsx`
- [ ] Do not touch or revert those files.
- [ ] Confirm `DIRECT_URL` is set in `.env`.
- [ ] Run `bunx prisma migrate status` and confirm there are no unexpected pending migrations or drift.

If the migration status shows drift or pending migrations unrelated to this work, stop and report before changing the schema.

#### 1.2 Schema edit

File: `prisma/conversation.prisma`

Replace the redundant single-column indexes:

```prisma
model Conversation {
  // ...
  @@index([customerId, lastMessageAt])
  @@index([shopId, lastMessageAt])
  @@index([status])
  @@map("conversations")
}

model Message {
  // ...
  @@index([conversationId, createdAt])
  @@index([senderId])
  @@map("messages")
}
```

Specifically:

- [ ] Replace `@@index([customerId])` with `@@index([customerId, lastMessageAt])`
- [ ] Replace `@@index([shopId])` with `@@index([shopId, lastMessageAt])`
- [ ] Keep `@@index([status])`
- [ ] Replace `@@index([conversationId])` with `@@index([conversationId, createdAt])`
- [ ] Keep `@@index([senderId])`
- [ ] Do not change any model field, relation, enum, or `@@map`

#### 1.3 Generate the migration without applying it

Because `prisma.config.ts` points `DIRECT_URL` at the configured database, do **not** run a plain `prisma migrate dev` that applies automatically.

Create the migration only:

```bash
bunx prisma migrate dev --name add_messaging_indexes --create-only
```

If Prisma cannot create a shadow database, fall back to generating the SQL with `prisma migrate diff` and place it in a new timestamped migration folder.

Expected migration SQL — three drops and three creates, nothing else:

```sql
DROP INDEX "conversations_customerId_idx";
DROP INDEX "conversations_shopId_idx";
DROP INDEX "messages_conversationId_idx";

CREATE INDEX "conversations_customerId_lastMessageAt_idx"
  ON "conversations"("customerId", "lastMessageAt");

CREATE INDEX "conversations_shopId_lastMessageAt_idx"
  ON "conversations"("shopId", "lastMessageAt");

CREATE INDEX "messages_conversationId_createdAt_idx"
  ON "messages"("conversationId", "createdAt");
```

Review checkpoint:

- [ ] Migration contains no `ALTER TABLE`, `CREATE TABLE`, or column changes
- [ ] Only the three old indexes are dropped
- [ ] Only the three composite indexes are created
- [ ] Migration folder is named `<timestamp>_add_messaging_indexes`
- [ ] Do not apply the migration until it is reviewed

After approval, apply it with the project’s normal path:

```bash
bun run db:deploy
```

`bun run db:deploy` runs `prisma migrate deploy` and does not create new migrations.

#### 1.4 Add the Ably dependency

- [ ] Add `ably` to `dependencies` in `package.json`
- [ ] Match the already-installed major version: `^2.30.0`

Preferred command:

```bash
bun add ably@^2.30.0
```

Notes:

- `node_modules/ably` already exists at `2.30.0`, but `package.json` does not declare it.
- There is currently no committed Bun lockfile. This command will create `bun.lock`. Include it in the Phase 1 review so the dependency is reproducible.
- No browser-side Ably key is added. The browser will use the token endpoint planned for Phase 2.

#### 1.5 Environment and documentation

- [ ] Add to `.env.example`:

```bash
# Ably real-time messaging (server-only, never expose to the browser)
ABLY_API_KEY=""
```

- [ ] Add `ABLY_API_KEY` to the README environment-variable table.
- [ ] Optionally add Ably to the README tech-stack table.
- [ ] Confirm the real key is present only in `.env`, which is gitignored.
- [ ] Do not log or print the key.

#### 1.6 Phase 1 verification

```bash
bunx prisma validate
bunx prisma format
bun run typecheck
```

Expected results:

- [ ] Prisma schema validates
- [ ] Formatting changes are limited to the index lines
- [ ] Typecheck passes
- [ ] `git diff --stat` shows only:
  - `prisma/conversation.prisma`
  - the new migration folder
  - `package.json`
  - `bun.lock` (if created)
  - `.env.example`
  - `README.md`
  - `docs/messaging-plan.md` (if this plan is updated)
- [ ] The user’s three pre-existing modified files are untouched

#### 1.7 Rollback

The migration is index-only and safe to revert by dropping the three new indexes and recreating the three old ones. No data is changed.

#### Phase 1 review deliverables

- Schema diff
- Migration SQL
- `package.json` / `bun.lock` diff
- `.env.example` and README diff
- Confirmation that the migration has **not** been applied automatically

**Stop after Phase 1 for review before starting Phase 2.**

### Phase 2 — Server foundation

Goal: add the Ably server module, one shared conversation-authorization helper, the shared messaging types, and the authenticated Ably token endpoint. No conversation/message APIs or UI in this phase.

#### 2.1 Preflight

- [ ] Confirm `bunx prisma migrate status` reports `Database schema is up to date!`
- [ ] Confirm local `.env` has a non-empty `ABLY_API_KEY`. If it is still blank, the endpoint must return `503`; never hard-code or commit a key.
- [ ] Do not modify the existing vendor or admin conversation routes in this phase.
- [ ] Leave the user’s pre-existing modified files untouched.

#### 2.2 Shared types — `src/types/messaging.ts`

Keep this file to the contracts Phase 2 actually uses. Conversation/message API DTOs are added in Phase 3 when their query shapes are fixed.

```ts
export type ConversationStatus = "OPEN" | "CLOSED";
export type ConversationParticipant = "customer" | "vendor";

export type MessageCreatedEvent = {
  type: "message.created";
  conversationId: string;
  message: {
    id: string;
    senderId: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
    isRead: boolean;
  };
};
```

- [ ] Use string literal unions, not imports from the generated Prisma client, so client code can import these types safely.
- [ ] Timestamps in events are ISO strings.

#### 2.3 Ably server module — `src/lib/ably.ts`

Server-only transport module. The browser must never import it.

Exports:

```ts
getUserChannelName(userId: string): string
createUserTokenRequest(userId: string): Promise<TokenRequest | null>
publishMessageCreated(
  recipientIds: string[],
  event: MessageCreatedEvent,
): Promise<void>
```

Behavior:

- [ ] `getUserChannelName(userId)` returns exactly `user:<userId>`.
- [ ] Lazily construct one Ably `Rest` client from `process.env.ABLY_API_KEY`.
- [ ] If `ABLY_API_KEY` is missing or empty, `createUserTokenRequest` returns `null`; it does not throw.
- [ ] Token params are exactly:
  - `clientId`: the authenticated user ID
  - `capability`: `{ [user:<userId>]: ['subscribe'] }`
  - `ttl`: 60 minutes
- [ ] No `publish`, `presence`, or `history` capability is granted to the browser.
- [ ] `publishMessageCreated` de-duplicates recipient IDs, publishes `message.created` to each recipient’s user channel, and awaits the attempts.
- [ ] Publish failures are logged with `logError` and never reject the helper, so a send can still succeed if Ably is down or unconfigured.
- [ ] The API key is never logged, returned, or included in an event.

Do not use an Ably channel per conversation. The per-user channel is the delivery boundary; authorization is enforced before the server publishes.

#### 2.4 Conversation access helper — `src/lib/conversation-access.ts`

One authorization helper for every Phase 3 conversation/message endpoint.

```ts
type ConversationAccess = {
  conversationId: string;
  customerId: string;
  vendorId: string;
  shopId: string;
  status: ConversationStatus;
  participant: ConversationParticipant;
  otherUserId: string;
};

getConversationAccess(
  conversationId: string,
  userId: string,
): Promise<
  | { access: ConversationAccess; response: null }
  | { access: null; response: Response }
>;
```

Query only the fields needed for authorization:

- `conversation.id`
- `conversation.customerId`
- `conversation.shopId`
- `conversation.status`
- `conversation.shop.ownerId`

Rules:

- [ ] Missing conversation → `404 { error: 'Conversation not found' }`
- [ ] Authenticated non-participant → `403 { error: 'Forbidden' }`
- [ ] `participant` is `customer` when `customerId === userId`, otherwise `vendor` when `shop.ownerId === userId`
- [ ] `otherUserId` is the vendor for the customer and the customer for the vendor
- [ ] Authorization is based on `customerId` / `shop.ownerId`, not the user’s role
- [ ] Admin, manager, and customer-service users are not participants unless they are the customer or shop owner
- [ ] Closed threads are still readable; write routes will reject based on `status` in Phase 3
- [ ] Existing admin/vendor routes remain untouched

#### 2.5 Token endpoint — `src/routes/api/chat/ably/token.ts`

`GET /api/chat/ably/token`, GET only (Ably’s `authUrl` default method).

Handler flow:

1. `requireAuth()`.
2. Call `createUserTokenRequest(session.user.id)`.
3. Return the Ably `TokenRequest` JSON with `Cache-Control: no-store`.
4. If Ably is not configured, return `503 { error: 'Real-time messaging is not configured' }`.
5. If signing fails, log the error and return `500 { error: 'Unable to create real-time token' }`.

- [ ] No `clientId` is accepted from the query string or body; it always comes from the session.
- [ ] No CSRF check is needed for this safe GET.
- [ ] Do not add a rate limiter in this phase: token signing is local and the endpoint is authenticated. Revisit only if abuse is observed.
- [ ] Never forward an Ably error message to the client.

#### 2.6 Focused tests

Add tests covering the security-critical parts now, before the APIs depend on them.

`src/lib/__tests__/-conversation-access.test.ts`:

- [ ] Missing conversation → 404
- [ ] Unrelated user → 403
- [ ] Customer gets `participant: 'customer'` and `otherUserId` = vendor
- [ ] Vendor gets `participant: 'vendor'` and `otherUserId` = customer
- [ ] Closed status is returned unchanged

`src/lib/__tests__/-ably.test.ts` (mock the `ably` module):

- [ ] Channel names are `user:<id>`
- [ ] Missing `ABLY_API_KEY` returns `null`
- [ ] Token request uses the user ID as `clientId`
- [ ] Token capability contains only `user:<id>: ['subscribe']`
- [ ] Token TTL is 60 minutes
- [ ] Publish sends to unique recipient channels
- [ ] Publish failure is logged and does not reject

`src/routes/api/chat/ably/__tests__/-token.test.ts`:

- [ ] Unauthenticated → 401
- [ ] Unconfigured Ably → 503
- [ ] Authenticated and configured → 200 with `Cache-Control: no-store`
- [ ] Signing failure → 500 without leaking the underlying error
- [ ] The handler never accepts a caller-supplied `clientId`

#### 2.7 Verification

```bash
bun run typecheck
bun run check
bun test src/lib/__tests__ src/routes/api/chat/ably/__tests__
bunx prisma migrate status
git diff --check
```

Acceptance:

- [ ] `src/lib/ably.ts`, `src/lib/conversation-access.ts`, `src/types/messaging.ts`, and the token route are the only new production files
- [ ] No schema changes or new migrations
- [ ] No `ABLY_API_KEY` value appears in git diff
- [ ] Existing vendor/admin routes are unchanged
- [ ] The token capability is subscribe-only and scoped to the session user
- [ ] Typecheck, focused tests, and Biome pass

#### Phase 2 review deliverables

- Ably module and exact token params
- Access helper response/status behavior
- Token endpoint failure behavior
- Focused test results
- Confirmation that no browser-side Ably key or publish capability exists

**Stop after Phase 2 for review before starting Phase 3.**

### Phase 3 — Conversation and message APIs

Goal: implement the customer/vendor conversation and message APIs under `/api/chat/` against the Phase 1 schema and the Phase 2 helpers. No client services, hooks, or UI in this phase.

#### 3.1 Preflight

- [ ] Phase 2 is reviewed and accepted.
- [ ] `bunx prisma migrate status` reports `Database schema is up to date!`. Do not add a migration in this phase.
- [ ] `ABLY_API_KEY` may still be blank. Sends must persist; publishing becomes a logged no-op until it is configured.
- [ ] Do not modify the existing vendor or admin conversation routes.
- [ ] Leave the user’s pre-existing modified files untouched.
- [ ] Change the shared message-image limit in `src/lib/message-upload.ts` to 1 MB before wiring the send route.
- [ ] After adding route files, run `bunx tsr generate` and commit the regenerated `src/routeTree.gen.ts`.

#### 3.2 Shared contracts — `src/types/messaging.ts`

Add the DTOs and the two text limits used by both the create and send routes. Keep this file free of generated Prisma imports so client code can import it safely.

```ts
export const SUBJECT_MAX_LENGTH = 200;
export const MESSAGE_MAX_LENGTH = 2000;

export type MessageSummary = {
  id: string;
  senderId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  isRead: boolean;
};

export type MessageView = MessageSummary & {
  conversationId: string;
  sender: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
};

export type ConversationCounterpart =
  | {
      kind: "shop";
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
    }
  | {
      kind: "customer";
      id: string;
      name: string;
      email: string;
      imageUrl: string | null;
    };

export type ConversationContext = {
  id: string;
  subject: string;
  status: ConversationStatus;
  lastMessageAt: string | null;
  createdAt: string;
  viewerRole: ConversationParticipant;
  counterpart: ConversationCounterpart;
  shop: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
  } | null;
  product: {
    id: string;
    slug: string;
    productName: string;
    imageUrl: string | null;
  } | null;
};

export type ConversationListItem = ConversationContext & {
  lastMessage: MessageSummary | null;
  messageCount: number;
};
```

Keep `MessageCreatedEvent` shape-compatible by defining its `message` as `MessageSummary`:

```ts
export type MessageCreatedEvent = {
  type: "message.created";
  conversationId: string;
  message: MessageSummary;
};
```

Rules:

- [ ] Timestamps in API responses and events are ISO strings.
- [ ] `imagePublicId` is never included in an API response or Ably event.
- [ ] `lastMessage` uses the same `MessageSummary` shape as a sent message.
- [ ] No Prisma types leak into client-importable code.

#### 3.3 Shared DTO/query helper — `src/lib/messaging-view.ts`

Server-only helper used by create/list/detail/messages/unread so the response shapes cannot drift.

Exports:

```ts
conversationContextSelect
toConversationContext(conversation, viewerRole)
messageSummarySelect
toMessageSummary(message)
messageViewSelect
toMessageView(message)
countUnreadMessages(userId): Promise<number>
```

- [ ] `conversationContextSelect` selects the conversation fields, `customer { id, name, email, imageUrl }`, `shop { id, name, slug, logoUrl }`, `order { id, orderNumber }`, and `product { id, slug, productName, images(take: 1, order: asc) }`.
- [ ] `toConversationContext` maps the first product image to `product.imageUrl`; missing product/image becomes `null`.
- [ ] Customer viewer → `counterpart` is the shop (`kind: 'shop'`, `imageUrl` = `logoUrl`).
- [ ] Vendor viewer → `counterpart` is the customer (`kind: 'customer'`).
- [ ] `messageSummarySelect` excludes `imagePublicId`.
- [ ] `messageViewSelect` adds `sender { id, name, imageUrl }` and excludes `imagePublicId`.
- [ ] `countUnreadMessages` counts messages where `senderId !== userId`, `isRead = false`, and the conversation is either owned by the user as customer or by the user’s shop.
- [ ] Do not add per-thread unread counts. Per Section 2.3, row unread is derived from the last message; the header badge uses the total count.

#### 3.4 Create conversation — `POST /api/chat/conversations/create`

JSON body:

```ts
{
  shopId: string;
  subject: string;   // trim, 1..200
  message: string;   // trim, 1..2000
  productId?: string | null;
  orderId?: string | null;
}
```

Flow:

1. `requireAuth()`.
2. `validateCsrf()`.
3. `checkRateLimit(messageLimiter, "user:" + session.user.id)`.
4. Parse JSON and validate with Zod. Malformed JSON → `400`.
5. Load the shop with `id`, `name`, `slug`, `logoUrl`, `ownerId`, and `status`.
6. Reject a missing shop with `404`; reject a non-`ACTIVE` shop with `400`.
7. Reject self-messaging when `session.user.id === shop.ownerId` with `400`.
8. Validate optional product/order context.
9. Find the matching OPEN thread.
10. Create the message and update `lastMessageAt` in one transaction.
11. Publish `message.created` after commit.
12. Return `201 { conversation, message }`.

Validation:

- [ ] Shop must exist and be `ACTIVE`.
- [ ] The session user may act as a customer regardless of role. The only role-like rule is no self-messaging with a shop they own.
- [ ] If `productId` is present, the product must exist and `product.shopId === shopId`. Otherwise `400 { error: 'Product does not belong to this shop' }`.
- [ ] If `orderId` is present, the order must belong to the session user and contain at least one item for `shopId`. Otherwise `400 { error: 'Order does not belong to this customer and shop' }`. Use a single `findFirst` with `customerId` and `items: { some: { shopId } }` so another customer’s order is not disclosed.
- [ ] `subject` and `message` are trimmed, non-empty, and bounded by the shared constants.
- [ ] `productId` and `orderId` are optional or nullable; normalize empty values to `null`.
- [ ] Unknown JSON fields are ignored.

Thread reuse:

- [ ] Match `customerId`, `shopId`, `status: 'OPEN'`, `orderId: orderId ?? null`, and `productId: productId ?? null`.
- [ ] Use `orderBy: { createdAt: 'desc' }` so a legacy duplicate set reuses the newest OPEN thread.
- [ ] If only a CLOSED match exists, create a new OPEN thread. Do not reopen closed history.
- [ ] On reuse, keep the existing thread’s `subject`. The submitted subject is used only when creating a new thread.
- [ ] Concurrent first-message requests may still create duplicate OPEN threads. This is accepted for v1 per Section 12; do not add a lock, unique constraint, or new migration.

Transaction:

- [ ] Use one `lastMessageAt`/`createdAt` timestamp (`now`) for the message and conversation update.
- [ ] Existing thread:
  - `updateMany({ where: { id, status: 'OPEN' }, data: { lastMessageAt: now } })`.
  - If `count === 0`, throw a closed-thread conflict and roll back; return `409`.
  - Create the message with `createdAt: now`.
- [ ] New thread:
  - Create the conversation with `status: 'OPEN'`, `lastMessageAt: now`.
  - Create the first message with `createdAt: now`.
  - Both writes are in the same transaction.
- [ ] Return the existing/new conversation through `toConversationContext` and the message through `toMessageSummary`.

Publishing:

- [ ] Publish after the transaction commits to both `[customerId, vendorId]`.
- [ ] Await `publishMessageCreated`; the helper logs and swallows failures, so the `201` response is unaffected.
- [ ] Do not publish before commit.
- [ ] If Ably is unconfigured, the message still persists and the response still succeeds.

#### 3.5 List conversations — `GET /api/chat/conversations/list`

- [ ] `requireAuth()`.
- [ ] Query conversations where `customerId = userId` OR `shop.ownerId = userId`, so a user who is both a customer and a vendor sees both sets.
- [ ] Select `conversationContextSelect`, the newest message (`orderBy createdAt desc, id desc`, `take: 1`), and `_count.messages`.
- [ ] Order by `lastMessageAt` descending with nulls last, then `createdAt` descending.
- [ ] Set `viewerRole` to `customer` when `conversation.customerId === userId`, otherwise `vendor`.
- [ ] Map each row to `ConversationListItem` with `lastMessage` and `messageCount`.
- [ ] Get the total `unreadCount` from `countUnreadMessages(userId)`.
- [ ] Return `200 { conversations, unreadCount }`.
- [ ] Do not apply admin/staff access. Only the two participant relationships are allowed.

#### 3.6 Unread — `GET /api/chat/conversations/unread`

- [ ] `requireAuth()`.
- [ ] Return `200 { unreadCount }` from `countUnreadMessages(userId)`.
- [ ] Count only messages sent by the other party and still unread.
- [ ] Own sent messages must never contribute.

#### 3.7 Conversation detail — `GET /api/chat/conversations/$conversationId`

- [ ] `requireAuth()`.
- [ ] Call `getConversationAccess(params.conversationId, session.user.id)` and return its `403`/`404` response unchanged.
- [ ] Load `conversationContextSelect` by ID. If it disappeared between the access check and the load, return `404`.
- [ ] Map with `access.participant` and return `200 { conversation }`.
- [ ] Closed threads remain readable.

#### 3.8 Update conversation — `PATCH /api/chat/conversations/$conversationId`

JSON body:

```ts
{ action: 'read' } | { action: 'close' }
```

- [ ] `requireAuth()`.
- [ ] `validateCsrf()`.
- [ ] Validate the discriminated union. A malformed body or unknown action → `400`.
- [ ] Call `getConversationAccess`; return `403`/`404` unchanged.
- [ ] `read`: `updateMany` where `conversationId`, `senderId: { not: userId }`, and `isRead: false`; set `isRead: true`. Return `200 { success: true, updated: count }`. It is idempotent.
- [ ] `close`: set `status: 'CLOSED'`. Return `200 { success: true, status: 'CLOSED' }`. It is idempotent.
- [ ] Read and close are allowed on an already-closed thread.
- [ ] Neither action publishes an Ably event; read receipts and close notifications are out of scope.

#### 3.9 List messages — `GET /api/chat/messages/list?conversationId=`

- [ ] `requireAuth()`.
- [ ] Require a non-empty `conversationId` query value; otherwise `400`.
- [ ] Call `getConversationAccess`; return `403`/`404` unchanged.
- [ ] Query messages by `conversationId`, ascending by `createdAt` then `id`.
- [ ] Select `messageViewSelect` and map with `toMessageView`.
- [ ] Return `200 { messages }`.
- [ ] V1 returns the full thread; no cursor pagination.
- [ ] Never return `imagePublicId`.
- [ ] Do not grant admin/staff access here. Existing admin message endpoints remain separate.

#### 3.10 Send message — `POST /api/chat/messages/create`

`multipart/form-data` fields:

```text
conversationId: string
content: string | null
image: File | null
```

Flow:

1. `requireAuth()`.
2. `validateCsrf()`.
3. `checkRateLimit(messageLimiter, "user:" + session.user.id)`.
4. Parse `request.formData()`. Malformed multipart → `400`.
5. Validate `conversationId`, `content`, and the optional image.
6. Call `getConversationAccess`; return `403`/`404` unchanged.
7. Reject a `CLOSED` conversation with `409 { error: 'Conversation is closed' }` before uploading.
8. If an image is present, call `uploadMessageImage`.
9. Run the transaction.
10. Publish after commit.
11. Return `201 { message }`.

Validation:

- [ ] `conversationId` must be a non-empty string.
- [ ] `content` must be a string when present; trim it. It may be empty only when a valid image is present.
- [ ] Trimmed `content` is limited to `MESSAGE_MAX_LENGTH`.
- [ ] A request with neither text nor image → `400`.
- [ ] Image is validated by `uploadMessageImage`: JPEG/PNG/WebP/GIF, max 1 MB.
- [ ] Update `src/lib/message-upload.ts`: `MESSAGE_IMAGE_MAX_BYTES = 1 * 1024 * 1024` and the error text to `Image must be under 1MB`. This shared helper also governs `/api/upload/message`.
- [ ] An invalid image → `400` and no message write.
- [ ] Image-only messages store `content: ''`.
- [ ] Text-only messages store `imageUrl: null`, `imagePublicId: null`.
- [ ] `senderId` always comes from the session.
- [ ] `isRead` starts `false`.

Transaction:

- [ ] Use one `now` timestamp for `lastMessageAt` and `message.createdAt`.
- [ ] `updateMany({ where: { id: conversationId, status: 'OPEN' }, data: { lastMessageAt: now } })`.
- [ ] If `count === 0`, throw a closed-thread conflict. The transaction rolls back and the route returns `409`.
- [ ] Create the message with the validated content, image fields, and `createdAt: now`.
- [ ] If the DB transaction fails after a successful image upload, best-effort delete the uploaded image with `DeleteImage(imagePublicId)` and log cleanup failure. Do not delete the image when only the Ably publish fails; the DB row references it.
- [ ] Unexpected DB failures: log with `logError` and return a generic `500`.

Publishing:

- [ ] Publish after commit to both `[access.customerId, access.vendorId]`.
- [ ] Await the helper; it never rejects, so publish failure is logged but the `201` succeeds.
- [ ] The sender receives their own event; Phase 4 deduplicates by `message.id`.
- [ ] Do not publish when the DB transaction fails.

#### 3.11 Status codes

| Situation                                    | Status                     |
| -------------------------------------------- | -------------------------- |
| Unauthenticated                              | `401`                      |
| CSRF failure                                 | `403`                      |
| Non-participant                              | `403`                      |
| Missing conversation                         | `404`                      |
| Missing shop                                 | `404`                      |
| Invalid body/query/action                    | `400`                      |
| Inactive shop / self-messaging               | `400`                      |
| Product/order context mismatch               | `400`                      |
| Closed conversation write (create race/send) | `409`                      |
| Rate limit exceeded                          | `429`                      |
| Unexpected failure                           | generic `500` + `logError` |

#### 3.12 Focused tests

Mock `@/lib/auth-middleware`, `@/lib/csrf`, `@/lib/rate-limit-guard`, `@/lib/db`, `@/lib/conversation-access`, `@/lib/message-upload`, `@/lib/ably`, and `@/lib/logger` as needed. Extract handlers from `Route` the same way the Phase 2 token test does.

`src/routes/api/chat/conversations/__tests__/-create.test.ts`:

- [ ] Unauthenticated → `401`; CSRF failure → `403`; rate limit → `429`.
- [ ] Missing shop → `404`; inactive shop, self-shop, wrong-shop product, wrong-customer/shop order → `400`.
- [ ] Empty/whitespace/oversized subject or message → `400`.
- [ ] Reuses the matching OPEN thread and creates only the message.
- [ ] Creates a new OPEN thread when no match exists.
- [ ] Creates a new OPEN thread when only a CLOSED match exists.
- [ ] Existing OPEN thread closes between lookup and transaction (`updateMany` count 0) → `409` and no message create.
- [ ] Null `orderId`/`productId` match only context-free threads.
- [ ] Reuse keeps the existing subject.
- [ ] Publishes after commit to both participant IDs.
- [ ] Publish failure still returns `201`.
- [ ] Unexpected DB failure returns a generic `500`.
- [ ] Response contains no `imagePublicId`.

`src/routes/api/chat/conversations/__tests__/-list.test.ts`:

- [ ] Unauthenticated → `401`.
- [ ] Customer sees own threads; vendor sees shop threads; unrelated threads are excluded by the query.
- [ ] `viewerRole` and `counterpart` are correct for both roles.
- [ ] Last message and `messageCount` are mapped correctly.
- [ ] Ordering uses `lastMessageAt desc nulls last`.
- [ ] Total unread excludes the current user’s own messages.
- [ ] Unexpected DB failure returns a generic `500`.

`src/routes/api/chat/conversations/__tests__/-unread.test.ts`:

- [ ] Unauthenticated → `401`.
- [ ] Counts only counterpart unread messages in the user’s customer/shop threads.
- [ ] Own messages never count.
- [ ] Returns `200 { unreadCount }`.

`src/routes/api/chat/conversations/__tests__/-$conversationId.test.ts`:

- [ ] Detail: unauthenticated → `401`; `404` missing; `403` non-participant; `200` for both participants.
- [ ] Detail: closed thread is readable.
- [ ] `read` updates only counterpart messages and is idempotent.
- [ ] `close` sets `CLOSED` and is idempotent.
- [ ] Invalid action → `400`; CSRF failure → `403`.
- [ ] Read/close do not call the Ably publish helper.

`src/routes/api/chat/messages/__tests__/-list.test.ts`:

- [ ] Unauthenticated → `401`.
- [ ] Missing `conversationId` → `400`; `403`/`404` from access are preserved.
- [ ] Messages are ascending and include sender display fields.
- [ ] Closed threads remain readable.
- [ ] Image-only rows have `content: ''` and an `imageUrl`.
- [ ] `imagePublicId` is absent.
- [ ] Unexpected DB failure returns a generic `500`.

`src/routes/api/chat/messages/__tests__/-create.test.ts`:

- [ ] Unauthenticated → `401`; CSRF failure → `403`; rate limit → `429`.
- [ ] Missing conversation ID, empty text with no image, and oversized text → `400`.
- [ ] Text-only, image-only, and text+image are accepted.
- [ ] Image-only stores `content: ''`.
- [ ] Invalid image → `400` and no message create.
- [ ] Image just over 1 MB → `400` with `Image must be under 1MB`; an image at or under 1 MB is accepted.
- [ ] Non-participant → `403`.
- [ ] Closed before upload → `409` and upload is not called.
- [ ] Closed race (`updateMany` count 0) → `409`, rollback, and uploaded image cleanup.
- [ ] Transaction creates the message and updates `lastMessageAt`.
- [ ] Publish happens after commit to both participant IDs.
- [ ] Publish failure still returns `201`.
- [ ] DB failure after upload cleans up the image and returns a generic `500`.
- [ ] Response contains no `imagePublicId`.

`src/lib/__tests__/-messaging-view.test.ts`:

- [ ] Customer counterpart is the shop; vendor counterpart is the customer.
- [ ] First product image is selected; missing product/image becomes `null`.
- [ ] Dates are ISO strings.
- [ ] `countUnreadMessages` excludes the current user’s messages and scopes to the user’s customer/shop threads.

#### 3.13 Verification

```bash
bunx tsr generate
bun run typecheck
bunx biome check <new and changed files>
bun test src/lib/__tests__ src/routes/api/chat/conversations/__tests__ src/routes/api/chat/messages/__tests__
bun run build
bunx prisma migrate status
git diff --check
```

Do not run a repo-wide Biome `--write` while the user’s pre-existing edits are present.

Acceptance:

- [ ] Conversation create/list/unread/detail/update and message list/send are implemented.
- [ ] Every conversation/message read and write uses `getConversationAccess`, except create/list/unread which are scoped by the authenticated user.
- [ ] Thread reuse, CLOSED behavior, and context validation match Sections 2.4 and 4.1.
- [ ] Conversation create and message send writes are transactional and publish only after commit.
- [ ] Publish failure never fails a successful create/send.
- [ ] CSRF is applied to create/send/PATCH; `messageLimiter` is applied to create/send.
- [ ] Image-only messages store `content: ''`; `imagePublicId` never leaves the server.
- [ ] Message images use the shared 1 MB limit; the old 5 MB limit is gone.
- [ ] No schema changes, no new migration, and existing vendor/admin routes unchanged.
- [ ] `src/routeTree.gen.ts` is regenerated.
- [ ] Typecheck, focused tests, Biome on changed files, build, migration status, and `git diff --check` pass.

#### Phase 3 review deliverables

- Endpoint contracts and status-code matrix
- Confirmation that every new endpoint is under `/api/chat/`
- Thread reuse and context-validation behavior
- Transaction and publish ordering
- Shared 1 MB image limit behavior
- Focused test results
- Confirmation of no schema changes and no changes to existing vendor/admin routes

**Stop after Phase 3 for review before starting Phase 4.**

### Phase 4 — Client data layer

Goal: restore the browser conversation/message data layer against the Phase 3 `/api/chat/` APIs and add real-time cache coordination. No messages UI, route wiring, API route, or schema changes in this phase.

#### 4.1 Preflight

- [ ] Phase 3 is reviewed and accepted.
- [ ] `bunx prisma migrate status` reports `Database schema is up to date!`.
- [ ] `src/services/conversations.ts` does not exist (it was deleted in `53da7d2`).
- [ ] Do not restore the old `/api/conversations/*`, `/api/messages/*`, vendor, or admin calls from `53da7d2^`.
- [ ] Do not modify existing vendor/admin conversation routes.
- [ ] Do not modify `src/routes/messages/index.tsx`; it remains the Phase 5 placeholder.
- [ ] Leave the user’s three pre-existing modified files untouched.
- [ ] `ABLY_API_KEY` stays server-only. Nothing in `src/services/` may read it.
- [ ] No route files are added or changed, so `src/routeTree.gen.ts` must not change.

#### 4.2 Files

New:

```text
src/services/conversations.ts
src/services/__tests__/-conversations.test.tsx
src/services/__tests__/-conversation-realtime.test.tsx
```

Changed only if the tests reveal a missing client-safe type:

```text
src/types/messaging.ts
```

Do not add a separate Ably client wrapper module or a new state library. The service owns the hooks; `apiClient` and TanStack Query are the existing seams.

#### 4.3 Shared response types

Define local response types in `src/services/conversations.ts` and import the DTOs from `src/types/messaging.ts`:

```ts
type ConversationListResponse = {
  conversations: ConversationListItem[];
  unreadCount: number;
};

type ConversationDetailResponse = {
  conversation: ConversationContext;
};

type MessagesResponse = {
  messages: MessageView[];
};

type CreateConversationInput = {
  shopId: string;
  subject: string;
  message: string;
  productId?: string | null;
  orderId?: string | null;
};

type CreateConversationResponse = {
  conversation: ConversationContext;
  message: MessageSummary;
};

type SendMessageResponse = {
  message: MessageSummary;
};

type MarkReadResponse = {
  success: true;
  updated: number;
};
```

Rules:

- [ ] Do not redeclare conversation/message shapes that already exist in `src/types/messaging.ts`.
- [ ] Do not import generated Prisma types into this service.
- [ ] Keep timestamps as the ISO strings returned by the API.
- [ ] Do not expose `imagePublicId`; the API does not return it.

#### 4.4 Query keys and invalidation boundaries

Reuse the existing keys exactly:

| Data                | Query key                                    |
| ------------------- | -------------------------------------------- |
| Inbox               | `[QUERY_KEYS.CONVERSATIONS]`                 |
| Unread count        | `[QUERY_KEYS.CONVERSATIONS, 'unread-count']` |
| Conversation detail | `[QUERY_KEYS.CONVERSATIONS, conversationId]` |
| Message history     | `[QUERY_KEYS.MESSAGES, conversationId]`      |

- [ ] `useConversations()` uses `[QUERY_KEYS.CONVERSATIONS]`.
- [ ] `useUnreadMessageCount()` uses `[QUERY_KEYS.CONVERSATIONS, 'unread-count']`.
- [ ] `useConversationDetail(id)` uses `[QUERY_KEYS.CONVERSATIONS, id]`.
- [ ] `useMessages(conversationId)` uses `[QUERY_KEYS.MESSAGES, conversationId]`.
- [ ] Invalidate the `[QUERY_KEYS.CONVERSATIONS]` prefix after any write or `message.created` event. Prefix matching intentionally refreshes the inbox, the selected detail, and the unread count in one call.
- [ ] Invalidate only the affected `[QUERY_KEYS.MESSAGES, conversationId]` history, never the whole `MESSAGES` prefix.
- [ ] Do not add a new query key for realtime events.

#### 4.5 REST hooks

`src/services/conversations.ts` uses `apiClient` for every request.

| Hook                              | Request                                          | Behavior                                        |
| --------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `useConversations()`              | `GET /api/chat/conversations/list`               | Returns `ConversationListResponse`              |
| `useUnreadMessageCount(options?)` | `GET /api/chat/conversations/unread`             | Returns `number`; `enabled` defaults to `true`  |
| `useConversationDetail(id)`       | `GET /api/chat/conversations/$conversationId`    | Enabled only when `id` is non-empty             |
| `useMessages(conversationId)`     | `GET /api/chat/messages/list?conversationId=...` | Enabled only when `conversationId` is non-empty |
| `useCreateConversationMutation()` | `POST /api/chat/conversations/create`            | JSON body; returns conversation + first message |
| `useSendMessageMutation()`        | `POST /api/chat/messages/create`                 | Accepts `FormData`; returns the created message |
| `useMarkAsReadMutation()`         | `PATCH /api/chat/conversations/$conversationId`  | Sends `{ action: 'read' }`                      |

Hook rules:

- [ ] `useUnreadMessageCount` accepts `{ enabled?: boolean }`, uses a 30-second `staleTime`, and keeps a 60-second refetch interval as a fallback when realtime is unavailable. Realtime invalidation is the primary update path.
- [ ] `useConversations` and `useMessages` do not use polling. They are refreshed by writes, realtime invalidation, and reconnect recovery.
- [ ] `useMessages` has no `refetchInterval`; remove the old 15-second polling behavior.
- [ ] Disabled detail/message queries must not issue a request.
- [ ] `useSendMessageMutation` passes the `FormData` directly to `apiClient.post`. Do not hard-code `Content-Type: multipart/form-data`; the browser must add the multipart boundary.
- [ ] `useSendMessageMutation` reads `conversationId` from the submitted `FormData` and invalidates `[QUERY_KEYS.MESSAGES, conversationId]` plus the `[QUERY_KEYS.CONVERSATIONS]` prefix after success.
- [ ] On a `409` send response, invalidate the `[QUERY_KEYS.CONVERSATIONS]` prefix so a conversation closed by the other party is refetched.
- [ ] `useCreateConversationMutation` accepts `CreateConversationInput` as JSON and invalidates the `[QUERY_KEYS.CONVERSATIONS]` prefix after success. It performs no navigation; Phase 6 owns navigation.
- [ ] `useCreateConversationMutation` is included now because Phase 6’s product/order entry points need one client contract. It does not add UI in this phase.
- [ ] `useMarkAsReadMutation` accepts `{ conversationId: string; silent?: boolean }`, sends `{ action: 'read' }`, and invalidates `[QUERY_KEYS.CONVERSATIONS]` plus `[QUERY_KEYS.MESSAGES, conversationId]` after success. Invalidating messages refreshes `isRead`.
- [ ] Mark-read is idempotent. The service does not send a role; the server derives participant identity from the session.
- [ ] Query hooks expose TanStack Query errors unchanged. Mutation hooks show a toast on failure unless `silent` is set.
- [ ] Extract the API error message with `axios.isAxiosError(error) ? error.response?.data?.error ?? error.message : fallback`, matching the existing service pattern.
- [ ] Do not use `useSession` inside these hooks. Phase 5 passes `user.id` from the root route context to the realtime hook.

#### 4.6 Realtime hook

Signature:

```ts
useConversationRealtime({
  userId,
  activeConversationId,
}: {
  userId?: string | null;
  activeConversationId?: string | null;
}): {
  status: 'idle' | 'connecting' | 'reconnecting' | 'connected' | 'unavailable';
}
```

Lifecycle:

- [ ] If `userId` is null or undefined, do not construct an Ably client; return `status: 'idle'`.
- [ ] Construct the client inside `useEffect`, never during render or SSR.
- [ ] Create the client with `authCallback`, not a key and not `authUrl`:

```ts
new Realtime({
  authCallback: async (_params, callback) => {
    try {
      const response = await apiClient.get<TokenRequest>(
        "/api/chat/ably/token",
      );
      callback(null, response.data);
    } catch (error) {
      callback(
        axios.isAxiosError(error)
          ? (error.response?.data?.error ?? error.message)
          : "Unable to authenticate realtime connection",
        null,
      );
    }
  },
});
```

- [ ] The token endpoint supplies `clientId`; the browser never passes one.
- [ ] The token is renewed by Ably through the same callback. The service does not cache the token.
- [ ] Subscribe on the channel `user:<userId>` to the event `message.created`.
- [ ] Do not import `src/lib/ably.ts`; it is server-only. Building the `user:` channel name from `userId` in the browser must match the server helper.
- [ ] Process only events that pass a runtime guard: `type === 'message.created'`, non-empty `conversationId`, and a message with a non-empty `id` and `senderId`.
- [ ] Ignore malformed payloads without throwing.
- [ ] On a valid event:
  1. Merge into `[QUERY_KEYS.MESSAGES, event.conversationId]` if that cache entry exists.
  2. Invalidate the `[QUERY_KEYS.CONVERSATIONS]` prefix.
  3. If `event.conversationId === activeConversationId` and `event.message.senderId !== userId`, call mark-read silently.
- [ ] Do not mark the thread read for the user’s own echoed event.
- [ ] Also mark the active thread read when `activeConversationId` changes to a non-empty value. This is the only owner of automatic mark-read; Phase 5 must not add a second call.
- [ ] Do not resubscribe when only `activeConversationId` changes. Keep the current active ID and user ID in refs so the Ably effect depends on `userId` only.
- [ ] On cleanup, unsubscribe the `message.created` listener, remove the connection listener, and close the Ably client.
- [ ] Guard all state updates after cleanup so unmounting does not warn or update unmounted state.

Cache merge:

- [ ] Deduplicate by `message.id`. The sender receives its own event, and the send mutation also invalidates the thread, so the same message may arrive through both paths.
- [ ] If the ID is already present, do not append or reorder.
- [ ] Sort after append by `createdAt`, then `id`, matching the server’s message ordering.
- [ ] Ably events carry `MessageSummary`, while the message-history query returns `MessageView`. Reuse the `sender` object already cached for the same `senderId`. If no sender metadata exists yet, use `{ id: senderId, name: '', imageUrl: null }` and invalidate that thread’s message query once so the authoritative sender fields replace the placeholder.
- [ ] Do event cache writes only when a `[MESSAGES, conversationId]` entry already exists. If the thread has never been loaded, the inbox invalidation is sufficient; do not create a partial history cache.

Connection status:

- [ ] `initialized` / `connecting` → `connecting` before the first connection; `reconnecting` after a prior connection.
- [ ] `connected` → `connected`.
- [ ] `disconnected` / `suspended` → `reconnecting`. Ably retries these automatically.
- [ ] `failed` or a token endpoint failure (`401`, `503`, network error) → `unavailable`.
- [ ] `closing` / `closed` → `idle`.
- [ ] On the first `connected`, do not invalidate queries; the initial REST fetch is authoritative.
- [ ] On a later `connected` after a disconnect, invalidate the `[QUERY_KEYS.CONVERSATIONS]` prefix and the active `[QUERY_KEYS.MESSAGES, activeConversationId]` query to recover events missed while offline.
- [ ] Do not add a manual reconnect loop. Ably owns reconnect and token renewal; the returned `status` lets Phase 5 show a non-blocking hint.

#### 4.7 Mark-read behavior

- [ ] Opening a thread calls `PATCH /api/chat/conversations/$conversationId` with `{ action: 'read' }`.
- [ ] Receiving a counterpart message in the active thread calls the same endpoint after merging/invalidating the event.
- [ ] Own messages never trigger mark-read.
- [ ] Automatic calls use `silent: true` so transient network failures do not produce toast spam.
- [ ] The mutation’s success invalidates the inbox prefix and the affected message history so local `isRead` flags match Postgres.
- [ ] Read and close publish no Ably event, so mark-read cannot create a realtime loop.
- [ ] Multiple rapid events may issue more than one idempotent PATCH. Do not add a timer or debounce in v1.

#### 4.8 Focused tests

Use `renderHook`, a fresh `QueryClient` with retries disabled, and module mocks. Do not hit a real database, Ably, or network.

`src/services/__tests__/-conversations.test.tsx`:

- [ ] `useConversations` calls `/api/chat/conversations/list` and returns the API shape.
- [ ] `useUnreadMessageCount` calls `/api/chat/conversations/unread`, returns `unreadCount`, and respects `enabled: false`.
- [ ] `useConversationDetail` is disabled without an ID and calls the detail route with an ID.
- [ ] `useMessages` is disabled without an ID and calls the list route with the `conversationId` query parameter.
- [ ] `useSendMessageMutation` posts the exact `FormData` to `/api/chat/messages/create`, invalidates the affected message query, and invalidates the conversations prefix.
- [ ] A `409` send invalidates the conversations prefix.
- [ ] `useCreateConversationMutation` posts JSON to `/api/chat/conversations/create` and invalidates the conversations prefix.
- [ ] `useMarkAsReadMutation` sends `PATCH` with `{ action: 'read' }`, invalidates both the conversation and message queries, and does not toast when `silent` is true.
- [ ] No hook calls an old `/api/conversations/*` or `/api/messages/*` route.

`src/services/__tests__/-conversation-realtime.test.tsx`:

- [ ] No client is created when `userId` is null.
- [ ] The client subscribes to `user:<userId>` and `message.created`.
- [ ] `authCallback` fetches `/api/chat/ably/token` and passes the token request to Ably; no key or client ID is supplied by the hook.
- [ ] A valid event appends to the matching message cache.
- [ ] A duplicate `message.id` is ignored.
- [ ] An event for an inactive conversation does not modify the active message cache.
- [ ] An event invalidates the conversations prefix.
- [ ] A counterpart event in the active conversation marks it read; an own event does not.
- [ ] Changing `activeConversationId` marks the newly active thread read.
- [ ] `failed` sets `unavailable`; `connected` sets `connected`; reconnect invalidates the inbox and active history.
- [ ] Cleanup unsubscribes the listener, removes the connection listener, and closes the client.
- [ ] The hook never reads `ABLY_API_KEY`.

#### 4.9 Verification

```bash
bun run typecheck
bunx biome check src/services/conversations.ts src/services/__tests__
bun test src/services/__tests__
bun run build
git diff --check
```

Also inspect the diff:

```bash
git diff -- src/services src/types/messaging.ts
git status --short
```

Acceptance:

- [ ] `src/services/conversations.ts` restores only the hooks listed in 4.5 and the realtime hook in 4.6.
- [ ] Every request targets `/api/chat/conversations/*` or `/api/chat/messages/*`.
- [ ] No vendor/admin hooks, old polling service, or old API paths are restored.
- [ ] Query keys match 4.4 exactly.
- [ ] Realtime cache updates deduplicate by `message.id` and preserve server ordering.
- [ ] Inbox, detail, and unread caches refresh after writes and `message.created`.
- [ ] Active-thread mark-read is automatic, silent on failure, and does not loop.
- [ ] Ably authenticates through `/api/chat/ably/token`; the browser never receives `ABLY_API_KEY` or publish capability.
- [ ] Reconnect refreshes the inbox and active history; failure is surfaced through `status`, not a thrown render error.
- [ ] No UI, route, API, schema, or migration changes.
- [ ] Typecheck, focused tests, Biome on changed files, build, and `git diff --check` pass.
- [ ] The user’s three pre-existing modified files are untouched.

#### 4.10 Rollback

Delete `src/services/conversations.ts` and its two test files. No database, API, route, or UI state is changed by this phase, so rollback has no data consequences.

#### Phase 4 review deliverables

- Exported hook signatures and exact endpoint/query-key mapping
- Realtime auth/subscription/cleanup lifecycle
- Event validation, cache merge, deduplication, and ordering behavior
- Inbox/unread/detail invalidation boundaries
- Active-thread mark-read triggers and loop prevention
- Reconnect and unavailable behavior
- Focused test results
- Confirmation that no UI, route, API, schema, or server-only Ably code was touched

**Stop after Phase 4 for review before starting Phase 5.**

### Phase 5 — Messages UI

- [ ] Build inbox + conversation view in `src/routes/messages/index.tsx`
- [ ] Add mobile/desktop layout
- [ ] Add composer, image upload, closed state
- [ ] Add loading/error/empty states

**Review:** UI behavior with two browser sessions.

### Phase 6 — Entry points and final verification

- [ ] Fix product page create + navigate
- [ ] Fix order page create + navigate
- [ ] Run typecheck, lint, tests
- [ ] Complete manual checklist

**Review:** end-to-end flow.

---

## 11. Out of Scope

- Email notifications for new messages
- Typing indicators
- Presence
- Admin/staff participation in `/messages`
- Message editing, deletion, or reactions
- Read receipts beyond the existing `isRead` flag
- Cursor pagination for message history

---

## 12. Risks and Follow-ups

| Risk                                        | Mitigation                                                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate threads from simultaneous creates | Accepted in v1; find-or-create reuses the newest OPEN thread. A DB constraint can be added later.                                 |
| Ably outage                                 | Messages still persist; UI refetches. Add polling fallback only if needed.                                                        |
| DB write fails after image upload           | Best-effort `DeleteImage` in the send route; add periodic orphan cleanup only if needed.                                          |
| Ably publish latency delays send            | Publish is awaited after commit; the helper swallows failures. Move publishing off the response path if latency becomes material. |
| Large conversation histories                | Composite index added; cursor pagination is a later phase.                                                                        |
| Shop ownership transfer                     | Conversations stay attached to the shop, not the owner. This matches the current schema.                                          |
| Vendor with multiple staff accounts         | Not supported in v1; only `Shop.ownerId` can reply. Per-participant access is a future schema change.                             |
