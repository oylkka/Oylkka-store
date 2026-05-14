import type * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import { NavUserDropdown } from './nav-user-dropdown';
import { TeamSwitcher } from './team-switcher';
import type { User } from './types';

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain user={user} />
      </SidebarContent>
      <SidebarFooter>
        <NavUserDropdown user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
