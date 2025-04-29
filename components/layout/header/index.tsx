import Cart from './cart';
import HeaderClient from './header-client';
import Navigation from './navigation';
import SearchBar from './search-bar';
import UserDropDown from './user';

type HeaderProps = {
  navigation?: boolean;
};

export default function Header({ navigation = true }: HeaderProps) {
  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div
        className={`container mx-auto flex h-12 items-center justify-between pr-2 md:h-16 ${
          !navigation ? 'md:px-2' : 'md:px-0'
        }`}
      >
        <HeaderClient />
        {navigation && <Navigation />}
        <div className="flex flex-1 items-center justify-end gap-4 md:justify-end md:gap-6">
          <div className="hidden md:w-[280px] lg:block lg:w-[320px] xl:w-[380px]">
            <SearchBar />
          </div>
          <Cart />
          <UserDropDown />
        </div>
      </div>
    </header>
  );
}
