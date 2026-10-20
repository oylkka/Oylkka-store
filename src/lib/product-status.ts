export type ProductStatusBadge = {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  label: string;
};

/**
 * The label and tone for a product status, shared by every screen that shows
 * one (the vendor/admin product list and the vendor's own storefront grid).
 *
 * `REJECTED` is an admin moderation outcome — vendors can see it but cannot
 * set it. `ACTIVE` is a legacy spelling that the `ProductStatus` enum does not
 * contain; old rows may still carry it, and it means the same thing as
 * `PUBLISHED`.
 */
export function productStatusBadge(status: string): ProductStatusBadge {
  switch (status) {
    case 'PUBLISHED':
    case 'ACTIVE':
      return { variant: 'default', label: 'Published' };
    case 'DRAFT':
      return { variant: 'secondary', label: 'Draft' };
    case 'REJECTED':
      return { variant: 'destructive', label: 'Rejected' };
    case 'ARCHIVED':
      return { variant: 'outline', label: 'Archived' };
    case 'OUT_OF_STOCK':
      return { variant: 'destructive', label: 'Out of Stock' };
    default:
      return { variant: 'outline', label: status };
  }
}
