import { cn } from '@/lib/utils';
import { Route as RootRoute } from '@/routes/__root';
// import Cart from './cart';
import HeaderClient from './header-client';
import Navigation from './navigation';
import SearchBar from './searchbar';
import { ModeToggle } from './theme-switcher';
import UserDropDown from './user';

type HeaderProps = {
  navigation?: boolean;
  isHidden?: boolean;
};

export default function Header({
  navigation = true,
  isHidden = false,
}: HeaderProps) {
  const { user } = RootRoute.useRouteContext();
  return (
    <header className='bg-background sticky top-0 z-50 w-full border-b shadow-sm'>
      <div className='container py-4 md:py-5'>
        <div className='flex items-center justify-between gap-6'>
          {/* Left Section: Mobile Menu Trigger & Logo */}
          <div className='flex-none'>
            <HeaderClient />
          </div>

          {/* Middle Section: Desktop Navigation */}
          {navigation && (
            <div className='hidden flex-1 justify-center md:flex'>
              <Navigation />
            </div>
          )}

          {/* Right Section: Search, Theme, Notifications, Cart, User */}
          <div className='flex flex-none items-center justify-end gap-4'>
            {/* Desktop Search Bar */}
            <div
              className={cn(
                'hidden md:block md:w-70 lg:w-[320px] xl:w-95',
                isHidden && 'hidden',
              )}
            >
              <SearchBar />
            </div>
            {/* Removed MobileSearch component */}

            <div className='flex items-center gap-2'>
              {/* Desktop Theme Switcher */}
              <div className='hidden md:block'>
                <ModeToggle />
              </div>
              {/* {user && <Notifications />}
              {user && <Cart />}
              */}
              <UserDropDown user={user} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
