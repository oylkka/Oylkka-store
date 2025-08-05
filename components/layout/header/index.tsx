import Cart from './cart';
import HeaderClient from './header-client';
import Navigation from './navigation';
import Notifications from './notifications';
import SearchBar from './search-bar';
import { ThemeSwitcher } from './theme-switcher';
import UserDropDown from './user';

type HeaderProps = {
  navigation?: boolean;
  isHidden?: boolean;
};

export default function Header({
  navigation = true,
  isHidden = false,
}: HeaderProps) {
  return (
    <header className='bg-background sticky top-0 z-50 w-full border-b shadow-sm'>
      <div className='container py-3 md:py-4'>
        <div className='flex items-center justify-between gap-4'>
          <HeaderClient />

          {navigation && (
            <div className='hidden flex-1 justify-center md:flex'>
              <Navigation />
            </div>
          )}

          <div className='flex items-center justify-end gap-3 md:gap-5'>
            <div className='hidden md:block md:w-[280px] lg:w-[320px] xl:w-[380px]'>
              <SearchBar isHidden={isHidden} />
            </div>
            <div className='flex items-center gap-1 md:gap-3'>
              <ThemeSwitcher />
              <Notifications />
              <Cart />
              <UserDropDown />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
