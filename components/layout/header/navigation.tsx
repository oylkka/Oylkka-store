'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Shop', href: '/shop' },
  { label: 'Sale', href: '/sale' },
  { label: 'About', href: '/about' },
];

export default function Navigation() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({});
  const [prevActiveIndex, setPrevActiveIndex] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Determine active index based on current path
  const activeIndex = navItems.findIndex((item) =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
  );

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const currentActiveIndex = activeIndex >= 0 ? activeIndex : 0;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      setPrevActiveIndex(currentActiveIndex);
    }

    const activeElement = tabRefs.current[currentActiveIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;

      if (prevActiveIndex !== null && prevActiveIndex !== currentActiveIndex) {
        const prevElement = tabRefs.current[prevActiveIndex];
        if (prevElement) {
          const { offsetLeft: prevLeft } = prevElement;

          // Animate from previous position
          setActiveStyle({
            transform: `translateX(${prevLeft}px)`,
            width: `${offsetWidth}px`,
            transition: 'none',
          });

          // Trigger reflow
          void activeElement.offsetHeight;

          // Animate to new position
          requestAnimationFrame(() => {
            setActiveStyle({
              transform: `translateX(${offsetLeft}px)`,
              width: `${offsetWidth}px`,
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            });
          });
        }
      } else {
        setActiveStyle({
          transform: `translateX(${offsetLeft}px)`,
          width: `${offsetWidth}px`,
        });
      }
    }

    setPrevActiveIndex(currentActiveIndex);
  }, [activeIndex, prevActiveIndex]);

  return (
    <nav className='relative flex items-center justify-center'>
      <div className='relative'>
        {/* Hover Highlight */}
        <div
          className='bg-primary/10 dark:bg-primary/20 absolute flex items-center rounded-full transition-all duration-300 ease-out'
          style={{
            ...hoverStyle,
            opacity: hoveredIndex !== null ? 1 : 0,
            height: '95%',
          }}
        />

        {/* Active Indicator */}
        <div
          className='bg-primary absolute bottom-[-4px] h-[3px] rounded-full transition-all duration-300 ease-out'
          style={activeStyle}
        />

        {/* Tabs */}
        <div className='relative flex items-center space-x-1 md:space-x-2'>
          {navItems.map((item, index) => (
            <Link
              // biome-ignore lint: error
              key={index}
              href={item.href}
              className={cn(
                'focus-visible:ring-primary rounded-full outline-none focus-visible:ring-2',
                'transition-colors duration-300',
              )}
            >
              {/* biome-ignore lint: error */}
              <div
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className={cn(
                  'cursor-pointer rounded-full px-3 py-2 transition-all duration-300',
                  index === activeIndex
                    ? 'text-primary font-medium'
                    : 'text-foreground/70 hover:text-foreground',
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className='flex h-full items-center justify-center text-sm font-medium whitespace-nowrap'>
                  {item.label}
                  {item.label === 'Sale' && (
                    <span className='ml-1 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white'>
                      20%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
