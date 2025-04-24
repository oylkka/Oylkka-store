import {
  BadgePercent,
  BarChart2,
  ChevronRight,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Users,
} from 'lucide-react';

import { auth } from '@/auth';
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

interface SubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  isActive?: boolean;
  items: SubItem[];
}

export async function NavMain() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  // Common navigation items for all users
  const commonNavItems: NavItem[] = [
    {
      title: 'Shop',
      url: '/shop',
      icon: ShoppingCart,
      isActive: true,
      items: [
        {
          title: 'All Products',
          url: '/shop/all',
        },
        {
          title: 'New Arrivals',
          url: '/shop/new',
        },
        {
          title: 'Featured',
          url: '/shop/featured',
        },
        {
          title: 'Best Sellers',
          url: '/shop/best-sellers',
        },
      ],
    },
    {
      title: 'Categories',
      url: '/categories',
      icon: Tag,
      items: [
        {
          title: 'Clothing',
          url: '/categories/clothing',
        },
        {
          title: 'Accessories',
          url: '/categories/accessories',
        },
        {
          title: 'Footwear',
          url: '/categories/footwear',
        },
        {
          title: 'Home & Living',
          url: '/categories/home',
        },
      ],
    },
    {
      title: 'My Orders',
      url: '/orders',
      icon: Package,
      items: [
        {
          title: 'Active Orders',
          url: '/orders/active',
        },
        {
          title: 'Order History',
          url: '/orders/history',
        },
        {
          title: 'Returns',
          url: '/orders/returns',
        },
      ],
    },
    {
      title: 'Promotions',
      url: '/promotions',
      icon: BadgePercent,
      items: [
        {
          title: 'Current Deals',
          url: '/promotions/deals',
        },
        {
          title: 'Clearance',
          url: '/promotions/clearance',
        },
        {
          title: 'Seasonal',
          url: '/promotions/seasonal',
        },
      ],
    },
  ];

  // Admin-only navigation items
  const adminNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: BarChart2,
      items: [
        {
          title: 'Sales Overview',
          url: '/admin/dashboard/sales',
        },
        {
          title: 'Inventory',
          url: '/admin/dashboard/inventory',
        },
        {
          title: 'Analytics',
          url: '/admin/dashboard/analytics',
        },
      ],
    },
    {
      title: 'Product Management',
      url: '/admin/products',
      icon: Package,
      items: [
        {
          title: 'Add Product',
          url: '/dashboard/add-product',
        },
        {
          title: 'Edit Products',
          url: '/admin/products/edit',
        },
        {
          title: 'Categories',
          url: '/admin/products/categories',
        },
        {
          title: 'Inventory',
          url: '/admin/products/inventory',
        },
      ],
    },
    {
      title: 'Customer Management',
      url: '/admin/customers',
      icon: Users,
      items: [
        {
          title: 'Customer List',
          url: '/admin/customers/list',
        },
        {
          title: 'Customer Reports',
          url: '/admin/customers/reports',
        },
        {
          title: 'Support Tickets',
          url: '/admin/customers/tickets',
        },
      ],
    },
    {
      title: 'Order Management',
      url: '/admin/orders',
      icon: ShoppingCart,
      items: [
        {
          title: 'All Orders',
          url: '/dashboard/admin/orders',
        },
        {
          title: 'Pending Orders',
          url: '/dashboard/admin/orders?status=PENDING',
        },
        {
          title: 'Shipped Orders',
          url: '/dashboard/admin/orders?status=SHIPPED',
        },
        {
          title: 'Returns & Refunds',
          url: '/dashboard/admin/orders?status=REFUNDED',
        },
      ],
    },
  ];

  // Account settings for all users with some admin-specific options
  const accountSettingsItem: NavItem = {
    title: 'Account',
    url: '/account',
    icon: Settings,
    items: [
      {
        title: 'Profile',
        url: '/account/profile',
      },
      {
        title: 'Addresses',
        url: '/account/addresses',
      },
      {
        title: 'Payment Methods',
        url: '/account/payment',
      },
      {
        title: 'Wishlist',
        url: '/account/wishlist',
      },
      ...(isAdmin
        ? [
            {
              title: 'Store Settings',
              url: '/admin/settings/store',
            },
            {
              title: 'Security',
              url: '/admin/settings/security',
            },
          ]
        : []),
    ],
  };

  // Combine the navigation items based on user role
  const navItems = [
    ...commonNavItems,
    ...(isAdmin ? adminNavItems : []),
    accountSettingsItem,
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {isAdmin ? 'Store Management' : 'Shopping'}
      </SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
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
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
