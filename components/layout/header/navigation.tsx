"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Activity", href: "/activity" },
  { label: "Domains", href: "/domains" },
  { label: "Usage", href: "/usage" },
  { label: "Monitoring", href: "/monitoring" },
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
  const activeIndex = navItems.findIndex(
    (item) => item.href === (pathname === "/" ? "/" : pathname),
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
            transition: "none",
          });

          // Trigger reflow
          void activeElement.offsetHeight;

          // Animate to new position
          requestAnimationFrame(() => {
            setActiveStyle({
              transform: `translateX(${offsetLeft}px)`,
              width: `${offsetWidth}px`,
              transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
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
    <nav className="relative hidden w-full items-center justify-center border-none shadow-none md:flex">
      <div className="p-0">
        <div className="relative">
          {/* Hover Highlight */}
          <div
            className="absolute flex items-center rounded-[6px] bg-[#0e0f1114] transition-all duration-300 ease-out dark:bg-[#ffffff11]"
            style={{
              ...hoverStyle,
              opacity: hoveredIndex !== null ? 1 : 0,
            }}
          />

          {/* Active Indicator */}
          <div
            className="bg-primary absolute bottom-[-6px] h-[2px] dark:bg-white"
            style={activeStyle}
          />

          {/* Tabs */}
          <div className="relative flex items-center space-x-[6px]">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "focus-visible:ring-primary rounded-md outline-none focus-visible:ring-2",
                  "transition-colors duration-300",
                )}
              >
                <div
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  className={cn(
                    "cursor-pointer px-3 py-2",
                    index === activeIndex
                      ? "text-[#0e0e10] dark:text-white"
                      : "text-[#0e0f1199] hover:text-[#0e0e10]/80 dark:text-[#ffffff99] dark:hover:text-white/80",
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex h-full items-center justify-center text-sm leading-5 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
