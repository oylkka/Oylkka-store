import {
  BadgePercent,
  BarChart2,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
} from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { UserRole } from '@/generated/prisma/client';
import type { User } from './types';

interface SubItem {
  title: string;
  url: string;
  roles?: UserRole[];
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  isActive?: boolean;
  roles?: UserRole[];
  items: SubItem[];
}

export function NavMain({ user }: { user: User }) {
  const userRole = user.role as UserRole;

  const userNavItems: NavItem[] = [
    {
      title: 'Shopping',
      url: '/shop',
      icon: ShoppingCart,
      roles: ['USER'],
      items: [
        {
          title: 'Browse Products',
          url: '/shop',
        },
        {
          title: 'My Cart',
          url: '/cart',
        },
        {
          title: 'My Orders',
          url: '/dashboard/orders',
        },
        {
          title: 'My Wishlist',
          url: '/dashboard/wishlist',
        },
        {
          title: 'My Reviews',
          url: '/dashboard/reviews',
        },
        {
          title: 'Recently Viewed',
          url: '/shop/recently-viewed',
        },
      ],
    },
    {
      title: 'Sell',
      url: '/dashboard/become-vendor/apply',
      icon: Store,
      roles: ['USER'],
      items: [
        {
          title: 'Become a Vendor',
          url: '/dashboard/become-vendor/apply',
        },
      ],
    },
  ];

  const vendorNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard/vendor',
      icon: BarChart2,
      isActive: userRole === 'VENDOR',
      roles: ['VENDOR'],
      items: [
        {
          title: 'Overview',
          url: '/dashboard/vendor',
        },
        {
          title: 'Sales Analytics',
          url: '/dashboard/vendor/sales',
        },
        {
          title: 'Inventory',
          url: '/dashboard/vendor/inventory',
        },
        {
          title: 'Earnings',
          url: '/dashboard/vendor/earnings',
        },
      ],
    },
    {
      title: 'Products',
      url: '/dashboard/vendor/products',
      icon: ShoppingBag,
      roles: ['VENDOR'],
      items: [
        {
          title: 'All Products',
          url: '/dashboard/vendor/products',
        },
        {
          title: 'Add Product',
          url: '/dashboard/vendor/products/add',
        },
        {
          title: 'Reviews',
          url: '/dashboard/vendor/products/reviews',
        },
      ],
    },
    {
      title: 'Orders',
      url: '/dashboard/vendor/orders',
      icon: ClipboardList,
      roles: ['VENDOR'],
      items: [
        {
          title: 'All Orders',
          url: '/dashboard/vendor/orders',
        },
        {
          title: 'Processing',
          url: '/dashboard/vendor/orders?status=PROCESSING',
        },
        {
          title: 'Shipped',
          url: '/dashboard/vendor/orders?status=SHIPPED',
        },
        {
          title: 'Returns',
          url: '/dashboard/vendor/orders?status=REFUNDED',
        },
      ],
    },
    {
      title: 'Shipping',
      url: '/dashboard/vendor/shipping',
      icon: Truck,
      roles: ['VENDOR'],
      items: [
        {
          title: 'Settings',
          url: '/dashboard/vendor/shipping',
        },
        {
          title: 'Print Labels',
          url: '/dashboard/vendor/shipping/labels',
        },
        {
          title: 'Track Shipments',
          url: '/dashboard/vendor/shipping/tracking',
        },
      ],
    },
    {
      title: 'My Shop',
      url: '/dashboard/vendor/shop',
      icon: Store,
      roles: ['VENDOR'],
      items: [
        {
          title: 'Shop Profile',
          url: '/dashboard/vendor/shop',
        },
        {
          title: 'Branding',
          url: '/dashboard/vendor/shop/branding',
        },
      ],
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard/admin',
      icon: LayoutDashboard,
      isActive: userRole === 'ADMIN' || userRole === 'MANAGER',
      roles: ['ADMIN', 'MANAGER'],
      items: [
        {
          title: 'Overview',
          url: '/dashboard/admin',
        },
        {
          title: 'Sales',
          url: '/dashboard/admin/sales',
        },
        {
          title: 'Inventory',
          url: '/dashboard/admin/inventory',
        },
        {
          title: 'Reports',
          url: '/dashboard/admin/financial',
          roles: ['ADMIN'],
        },
      ],
    },
    {
      title: 'Catalog',
      url: '/dashboard/admin/products',
      icon: Package,
      roles: ['ADMIN', 'MANAGER'],
      items: [
        {
          title: 'All Products',
          url: '/dashboard/admin/products',
        },
        {
          title: 'Categories',
          url: '/dashboard/admin/category/all',
        },
        {
          title: 'Reviews',
          url: '/dashboard/admin/reviews',
        },
        {
          title: 'Bulk Upload',
          url: '/dashboard/admin/products/bulk',
          roles: ['ADMIN'],
        },
      ],
    },
    {
      title: 'Orders',
      url: '/dashboard/admin/orders',
      icon: ShoppingCart,
      roles: ['ADMIN', 'MANAGER'],
      items: [
        {
          title: 'All Orders',
          url: '/dashboard/admin/orders',
        },
        {
          title: 'Pending',
          url: '/dashboard/admin/orders?status=PENDING',
        },
        {
          title: 'Processing',
          url: '/dashboard/admin/orders?status=PROCESSING',
        },
        {
          title: 'Shipped',
          url: '/dashboard/admin/orders?status=SHIPPED',
        },
        {
          title: 'Returns',
          url: '/dashboard/admin/orders?status=RETURNED',
        },
      ],
    },
    {
      title: 'Customers',
      url: '/dashboard/admin/customers',
      icon: Users,
      roles: ['ADMIN', 'MANAGER'],
      items: [
        {
          title: 'All Customers',
          url: '/dashboard/admin/customers',
        },
        {
          title: 'Support Tickets',
          url: '/dashboard/admin/tickets',
        },
      ],
    },
    {
      title: 'Vendors',
      url: '/dashboard/admin/vendors',
      icon: Store,
      roles: ['ADMIN', 'MANAGER'],
      items: [
        {
          title: 'Vendor List',
          url: '/dashboard/admin/vendors',
        },
        {
          title: 'Applications',
          url: '/dashboard/admin/vendors?status=PENDING',
        },
        {
          title: 'Performance',
          url: '/dashboard/admin/vendors/performance',
        },
        {
          title: 'Payouts',
          url: '/dashboard/admin/vendors/payouts',
          roles: ['ADMIN'],
        },
      ],
    },
    {
      title: 'Marketing',
      url: '/dashboard/admin/banner/list',
      icon: BadgePercent,
      roles: ['ADMIN', 'MANAGER'],
      items: [
        {
          title: 'Banners',
          url: '/dashboard/admin/banner/list',
        },
        {
          title: 'Coupons & Discounts',
          url: '/dashboard/admin/coupons',
          roles: ['ADMIN'],
        },
        {
          title: 'SEO',
          url: '/dashboard/admin/seo',
          roles: ['ADMIN'],
        },
      ],
    },
    {
      title: 'Sell',
      url: '/dashboard/become-vendor/apply',
      icon: Store,
      roles: ['ADMIN', 'MANAGER'],
      items: [
        {
          title: 'Open a Shop',
          url: '/dashboard/become-vendor/apply',
        },
      ],
    },
  ];

  const customerServiceNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/dashboard/customer-service',
      icon: BarChart2,
      isActive: userRole === 'CUSTOMER_SERVICE',
      roles: ['CUSTOMER_SERVICE'],
      items: [
        {
          title: 'Overview',
          url: '/dashboard/customer-service',
        },
        {
          title: 'My Metrics',
          url: '/dashboard/customer-service/metrics',
        },
      ],
    },
    {
      title: 'Tickets',
      url: '/dashboard/customer-service/tickets',
      icon: MessageSquare,
      roles: ['CUSTOMER_SERVICE'],
      items: [
        {
          title: 'Open Tickets',
          url: '/dashboard/customer-service/tickets?status=OPEN',
        },
        {
          title: 'Pending Tickets',
          url: '/dashboard/customer-service/tickets?status=PENDING',
        },
        {
          title: 'Resolved Tickets',
          url: '/dashboard/customer-service/tickets?status=RESOLVED',
        },
        {
          title: 'Create Ticket',
          url: '/dashboard/customer-service/tickets/create',
        },
      ],
    },
    {
      title: 'Orders',
      url: '/dashboard/customer-service/orders',
      icon: ClipboardList,
      roles: ['CUSTOMER_SERVICE'],
      items: [
        {
          title: 'Order Lookup',
          url: '/dashboard/customer-service/orders',
        },
        {
          title: 'Process Return',
          url: '/dashboard/customer-service/orders/returns',
        },
        {
          title: 'Modify Order',
          url: '/dashboard/customer-service/orders/modify',
        },
      ],
    },
    {
      title: 'Knowledge Base',
      url: '/dashboard/customer-service/kb',
      icon: FileText,
      roles: ['CUSTOMER_SERVICE'],
      items: [
        {
          title: 'Product Info',
          url: '/dashboard/customer-service/kb/products',
        },
        {
          title: 'Policies',
          url: '/dashboard/customer-service/kb/policies',
        },
        {
          title: 'Common Issues',
          url: '/dashboard/customer-service/kb/issues',
        },
        {
          title: 'FAQ Templates',
          url: '/dashboard/customer-service/kb/faq',
        },
      ],
    },
  ];

  const accountNavItems: NavItem[] = [
    {
      title: 'Account',
      url: '/dashboard/profile',
      icon: Settings,
      roles: ['ADMIN', 'MANAGER', 'VENDOR', 'CUSTOMER_SERVICE', 'USER'],
      items: [
        {
          title: 'Profile',
          url: '/dashboard/profile',
        },
        {
          title: 'Notifications',
          url: '/dashboard/notifications',
        },
        {
          title: 'Messages',
          url: '/dashboard/messages',
        },
      ],
    },
  ];

  const userAccountNavItems: NavItem[] = [
    {
      title: 'Account',
      url: '/dashboard/profile',
      icon: Settings,
      roles: ['USER'],
      items: [
        {
          title: 'My Profile',
          url: '/dashboard/profile',
        },
        {
          title: 'Payment Methods',
          url: '/dashboard/payment-methods',
        },
        {
          title: 'Vouchers & Coupons',
          url: '/dashboard/vouchers',
        },
        {
          title: 'Notifications',
          url: '/dashboard/notifications',
        },
        {
          title: 'Messages',
          url: '/dashboard/messages',
        },
        {
          title: 'Help & Support',
          url: '/support',
        },
      ],
    },
  ];

  const filterItemsByRole = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((item) => ({
        ...item,
        items: item.items.filter(
          (subItem) => !subItem.roles || subItem.roles.includes(userRole),
        ),
      }));
  };

  const getSidebarLabel = () => {
    switch (userRole) {
      case 'ADMIN':
        return 'Admin Console';
      case 'MANAGER':
        return 'Management';
      case 'VENDOR':
        return 'Vendor Portal';
      case 'CUSTOMER_SERVICE':
        return 'Customer Service';
      default:
        return 'My Account';
    }
  };

  let navItems: NavItem[] = [];

  switch (userRole) {
    case 'ADMIN':
      navItems = [
        ...filterItemsByRole(adminNavItems),
        ...filterItemsByRole(accountNavItems),
      ];
      break;
    case 'MANAGER':
      navItems = [
        ...filterItemsByRole(adminNavItems),
        ...filterItemsByRole(accountNavItems),
      ];
      break;
    case 'VENDOR':
      navItems = [
        ...filterItemsByRole(vendorNavItems),
        ...filterItemsByRole(accountNavItems),
      ];
      break;
    case 'CUSTOMER_SERVICE':
      navItems = [
        ...filterItemsByRole(customerServiceNavItems),
        ...filterItemsByRole(accountNavItems),
      ];
      break;
    default:
      navItems = [
        ...filterItemsByRole(userNavItems),
        ...filterItemsByRole(userAccountNavItems),
      ];
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{getSidebarLabel()}</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className='group/collapsible'
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items.length > 0 && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
