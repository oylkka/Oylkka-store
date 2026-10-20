import { beforeEach, describe, expect, it, mock } from 'bun:test';

// Staff product control: an admin owns no shop, so the edit endpoint used to
// reject them before the ownership check ever ran. These tests pin the
// behaviour of both the staff-only listing and the edit bypass, and the vendor
// regression cases that must keep failing.

let currentUser: { id: string; role: string } | null = null;

mock.module('@tanstack/react-start/server', () => ({
  getRequestHeaders: () => new Headers(),
}));

mock.module('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: async () => (currentUser ? { user: currentUser } : null),
    },
  },
}));

mock.module('@/lib/rate-limit', () => ({ adminLimiter: {} }));
mock.module('@/lib/rate-limit-guard', () => ({
  checkRateLimit: async () => null,
}));
mock.module('@/lib/csrf', () => ({ validateCsrf: () => null }));
mock.module('@/lib/logger', () => ({ logError: () => {} }));
mock.module('@/cloudinary', () => ({
  UploadImage: async () => ({
    secure_url: 'https://cdn.example/x.jpg',
    public_id: 'x',
  }),
  DeleteImage: async () => {},
}));

type Row = Record<string, unknown>;

let shop: Row | null = null;
let existingProduct: Row | null = null;

const productFindMany = mock(async (): Promise<Row[]> => []);
const productUpdate = mock(async (args: Row) => ({
  id: 'p-1',
  ...(args.data as Row),
}));
// The moderation endpoint writes through the top-level client, not a
// transaction, so it needs its own spy to assert on.
const productModerate = mock(async (args: Row) => ({
  id: 'p-1',
  productName: 'Existing Name',
  ...(args.data as Row),
}));

const tx = {
  product: { update: productUpdate },
  orderItem: { findMany: async () => [] },
  productVariant: {
    deleteMany: async () => {},
    updateMany: async () => {},
    findMany: async () => [],
    create: async () => ({ id: 'v-1' }),
    update: async () => ({}),
  },
  productVariantImage: {
    findMany: async () => [],
    deleteMany: async () => {},
    create: async () => ({}),
  },
  productAttributeOption: { upsert: async () => ({ id: 'a-1' }) },
  productAttributeValue: { upsert: async () => ({ id: 'av-1' }) },
  productVariantAttribute: {
    deleteMany: async () => {},
    create: async () => ({}),
  },
  productImage: {
    deleteMany: async () => {},
    createMany: async () => ({}),
  },
};

mock.module('@/lib/db', () => ({
  prisma: {
    shop: { findUnique: async () => shop },
    product: {
      findUnique: async () => existingProduct,
      findMany: async () => productFindMany(),
      update: async (args: Row) => productModerate(args),
    },
    $transaction: async (fn: (t: unknown) => Promise<unknown>) => fn(tx),
  },
}));

type Handler = (args: { request: Request }) => Promise<Response>;
type RouteShape = {
  options?: { server?: { handlers?: Record<string, Handler> } };
  _options?: { server?: { handlers?: Record<string, Handler> } };
};

const handlerOf = (route: RouteShape, method: string): Handler | undefined =>
  route.options?.server?.handlers?.[method] ??
  route._options?.server?.handlers?.[method];

const adminListGet = handlerOf(
  (await import('@/routes/api/product/admin-list'))
    .Route as unknown as RouteShape,
  'GET',
);

const editPost = handlerOf(
  (await import('@/routes/api/product/edit')).Route as unknown as RouteShape,
  'POST',
);

const moderatePost = handlerOf(
  (await import('@/routes/api/product/moderate'))
    .Route as unknown as RouteShape,
  'POST',
);

/** A payload that passes ProductApiEditSchema unchanged for `existingProduct`. */
function editRequest(extra: Record<string, string> = {}) {
  const form = new FormData();
  form.append('id', 'p-1');
  form.append('productName', 'Existing Name');
  form.append('description', 'A sufficiently long description.');
  form.append('slug', 'existing-name');
  form.append('sku', 'CAT-PRD001');
  form.append('category', 'cat-1');
  form.append('price', '10');
  form.append('stock', '5');
  for (const [key, value] of Object.entries(extra)) {
    form.append(key, value);
  }

  return new Request('http://localhost/api/product/edit', {
    method: 'POST',
    body: form,
  });
}

const listing = () =>
  adminListGet?.({
    request: new Request('http://localhost/api/product/admin-list'),
  });

const editing = () => editPost?.({ request: editRequest() });

describe('GET /api/product/admin-list', () => {
  beforeEach(() => {
    currentUser = null;
    productFindMany.mockClear();
    productFindMany.mockImplementation(async () => []);
  });

  it('exposes a GET handler', () => {
    expect(typeof adminListGet).toBe('function');
  });

  it('rejects unauthenticated callers', async () => {
    const res = await listing();

    expect(res?.status).toBe(401);
    expect(productFindMany).not.toHaveBeenCalled();
  });

  it('rejects vendors', async () => {
    currentUser = { id: 'u-1', role: 'VENDOR' };

    const res = await listing();

    expect(res?.status).toBe(403);
    expect(productFindMany).not.toHaveBeenCalled();
  });

  it('rejects customer service (not an admin role)', async () => {
    currentUser = { id: 'u-1', role: 'CUSTOMER_SERVICE' };

    const res = await listing();

    expect(res?.status).toBe(403);
    expect(productFindMany).not.toHaveBeenCalled();
  });

  it('returns every shop’s products to an admin', async () => {
    currentUser = { id: 'u-1', role: 'ADMIN' };
    productFindMany.mockImplementation(async () => [
      { id: 'p-1', shopId: 's-1', status: 'PUBLISHED' },
      { id: 'p-2', shopId: 's-2', status: 'DRAFT' },
    ]);

    const res = await listing();

    expect(res?.status).toBe(200);
    const body = (await res?.json()) as Array<{ shopId: string }>;
    expect(body.map((p) => p.shopId)).toEqual(['s-1', 's-2']);
  });

  it('returns every shop’s products to a manager', async () => {
    currentUser = { id: 'u-1', role: 'MANAGER' };

    const res = await listing();

    expect(res?.status).toBe(200);
    expect(productFindMany).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/product/edit authorization', () => {
  beforeEach(() => {
    currentUser = null;
    shop = null;
    existingProduct = {
      id: 'p-1',
      shopId: 's-1',
      productName: 'Existing Name',
      slug: 'existing-name',
      sku: 'CAT-PRD001',
      images: [],
      variants: [],
      attributeOptions: [],
    };
    productUpdate.mockClear();
  });

  it('lets an admin with no shop of their own edit another shop’s product', async () => {
    currentUser = { id: 'admin-1', role: 'ADMIN' };
    shop = null;

    const res = await editing();

    expect(res?.status).toBe(200);
    expect(productUpdate).toHaveBeenCalledTimes(1);
  });

  it('lets a manager edit another shop’s product', async () => {
    currentUser = { id: 'mgr-1', role: 'MANAGER' };

    const res = await editing();

    expect(res?.status).toBe(200);
    expect(productUpdate).toHaveBeenCalledTimes(1);
  });

  it('still rejects a vendor with no active shop', async () => {
    currentUser = { id: 'v-1', role: 'VENDOR' };
    shop = null;

    const res = await editing();

    expect(res?.status).toBe(403);
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it('still rejects a vendor whose shop is pending', async () => {
    currentUser = { id: 'v-1', role: 'VENDOR' };
    shop = { id: 's-1', status: 'PENDING' };

    const res = await editing();

    expect(res?.status).toBe(403);
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it('still rejects a vendor editing another shop’s product', async () => {
    currentUser = { id: 'v-1', role: 'VENDOR' };
    shop = { id: 's-2', status: 'ACTIVE' };

    const res = await editing();

    expect(res?.status).toBe(401);
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it('still allows a vendor to edit their own product', async () => {
    currentUser = { id: 'v-1', role: 'VENDOR' };
    shop = { id: 's-1', status: 'ACTIVE' };

    const res = await editing();

    expect(res?.status).toBe(200);
    expect(productUpdate).toHaveBeenCalledTimes(1);
  });

  it('rejects customer service editing a product', async () => {
    currentUser = { id: 'cs-1', role: 'CUSTOMER_SERVICE' };

    const res = await editing();

    expect(res?.status).toBe(403);
    expect(productUpdate).not.toHaveBeenCalled();
  });

  it('clears the moderation note when the vendor relists', async () => {
    currentUser = { id: 'v-1', role: 'VENDOR' };
    shop = { id: 's-1', status: 'ACTIVE' };
    existingProduct = {
      ...(existingProduct as Row),
      status: 'REJECTED',
      rejectionReason: 'Photos do not match the item',
    };

    const res = await editPost?.({
      request: editRequest({ status: 'PUBLISHED' }),
    });

    expect(res?.status).toBe(200);
    expect(productUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PUBLISHED',
          rejectionReason: null,
        }),
      }),
    );
  });
});

const moderating = (body: unknown) =>
  moderatePost?.({
    request: new Request('http://localhost/api/product/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  });

describe('POST /api/product/moderate', () => {
  beforeEach(() => {
    currentUser = null;
    existingProduct = { id: 'p-1', productName: 'Existing Name' };
    productModerate.mockClear();
  });

  it('rejects unauthenticated callers', async () => {
    const res = await moderating({
      id: 'p-1',
      status: 'REJECTED',
      reason: 'Photos do not match the item',
    });

    expect(res?.status).toBe(401);
    expect(productModerate).not.toHaveBeenCalled();
  });

  it('rejects vendors', async () => {
    currentUser = { id: 'v-1', role: 'VENDOR' };

    const res = await moderating({
      id: 'p-1',
      status: 'REJECTED',
      reason: 'Photos do not match the item',
    });

    expect(res?.status).toBe(403);
    expect(productModerate).not.toHaveBeenCalled();
  });

  it('rejects customer service — no catalog control', async () => {
    currentUser = { id: 'cs-1', role: 'CUSTOMER_SERVICE' };

    const res = await moderating({
      id: 'p-1',
      status: 'REJECTED',
      reason: 'Photos do not match the item',
    });

    expect(res?.status).toBe(403);
    expect(productModerate).not.toHaveBeenCalled();
  });

  it('refuses a rejection without a reason the vendor could act on', async () => {
    currentUser = { id: 'admin-1', role: 'ADMIN' };

    const res = await moderating({ id: 'p-1', status: 'REJECTED' });

    expect(res?.status).toBe(400);
    expect(productModerate).not.toHaveBeenCalled();
  });

  it('refuses an outcome that is not a moderation decision', async () => {
    currentUser = { id: 'admin-1', role: 'ADMIN' };

    const res = await moderating({ id: 'p-1', status: 'DRAFT' });

    expect(res?.status).toBe(400);
    expect(productModerate).not.toHaveBeenCalled();
  });

  it('404s for a product that does not exist', async () => {
    currentUser = { id: 'admin-1', role: 'ADMIN' };
    existingProduct = null;

    const res = await moderating({
      id: 'missing',
      status: 'REJECTED',
      reason: 'Photos do not match the item',
    });

    expect(res?.status).toBe(404);
    expect(productModerate).not.toHaveBeenCalled();
  });

  it('rejects a listing for an admin, storing the reason', async () => {
    currentUser = { id: 'admin-1', role: 'ADMIN' };

    const res = await moderating({
      id: 'p-1',
      status: 'REJECTED',
      reason: 'Photos do not match the item',
    });

    expect(res?.status).toBe(200);
    expect(productModerate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p-1' },
        data: {
          status: 'REJECTED',
          rejectionReason: 'Photos do not match the item',
        },
      }),
    );
  });

  it('clears the reason when publishing a listing back', async () => {
    currentUser = { id: 'mgr-1', role: 'MANAGER' };

    const res = await moderating({ id: 'p-1', status: 'PUBLISHED' });

    expect(res?.status).toBe(200);
    expect(productModerate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'PUBLISHED', rejectionReason: null },
      }),
    );
  });
});
