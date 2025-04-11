import Link from 'next/link';

import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            <span className="text-primary">Mook</span>kly
          </h1>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
