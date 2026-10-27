"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, type PointerEvent } from 'react';

const links = [
  { label: 'work', href: '/work' },
  { label: 'writing', href: '/blog' },
  { label: 'about', href: '/about' },
  { label: 'contact', href: '/contact' },
];

// Matches --ease-spring in foundation.css; Web Animations can't read CSS variables.
const SPRING = 'linear(0, 0.0258, 0.09, 0.1763, 0.2732, 0.3724, 0.4683, 0.5573, 0.6376, 0.7082, 0.7689, 0.8202, 0.8628, 0.8976, 0.9256, 0.9476, 0.9648, 0.9778, 0.9875, 0.9945, 0.9994, 1.0026, 1.0047, 1.0058, 1.0062, 1.0062, 1.0059, 1.0055, 1.0049, 1.0043, 1.0036, 1.0031, 1.0025, 1.002, 1.0016, 1.0013, 1)';

// One shared highlight glides between links with a CSS transition, which
// retargets from its current position when the pointer moves mid-flight. The
// DOM is written directly so hovering never re-renders the header.
export default function Navbar() {
  const pathname = usePathname();
  const hover = useRef<HTMLSpanElement>(null);
  const current = useRef<HTMLSpanElement>(null);
  const previous = useRef<DOMRect | null>(null);

  function showHover(event: PointerEvent<HTMLAnchorElement>) {
    const pill = hover.current;
    if (!pill || event.pointerType !== 'mouse') return;
    const link = event.currentTarget;
    const appearing = pill.dataset.visible !== 'true';
    // A pill that is just appearing fades in place rather than sliding from its last spot.
    if (appearing) pill.style.transition = 'none';
    // Offsets are relative to the nav; the pill sits 2px inside the link vertically.
    pill.style.transform = `translate(${link.offsetLeft}px, ${link.offsetTop + 2}px)`;
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.height = `${link.offsetHeight - 4}px`;
    if (appearing) { void pill.offsetWidth; pill.style.transition = ''; }
    pill.dataset.visible = 'true';
  }
  function hideHover() { if (hover.current) hover.current.dataset.visible = 'false'; }

  // The current-page underline slides from the previous page's link to the new one.
  useLayoutEffect(() => {
    const line = current.current;
    const next = line?.getBoundingClientRect() ?? null;
    const from = previous.current;
    previous.current = next;
    if (!line || !next || !from || !next.width || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    line.animate(
      [{ transform: `translateX(${from.left - next.left}px) scaleX(${from.width / next.width})` }, { transform: 'none' }],
      { duration: 580, easing: SPRING },
    );
  }, [pathname]);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-hairline bg-ink-0/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-y-2 px-6 py-3 md:flex-row md:items-baseline md:justify-between md:gap-6 md:px-10 md:py-4">
        <Link href="/" className="group flex shrink-0 items-baseline gap-3 no-underline">
          <span className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.02em] text-paper-0">
            thomas<span className="text-chrome-mid">newman</span>
          </span>
          <span className="hidden text-[12px] text-paper-2 transition-colors group-hover:text-paper-1 lg:inline">
            computer engineer
          </span>
        </Link>
        <nav aria-label="Primary" className="nav-primary relative min-w-0">
          <span ref={hover} className="nav-hover" aria-hidden="true" />
          <ul className="nav-list flex flex-wrap items-baseline gap-y-1.5 md:flex-nowrap md:gap-2 md:whitespace-nowrap" onPointerLeave={hideHover}>
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className="nav-link relative text-[13.5px] font-medium tracking-[0.005em] text-paper-1 transition-colors duration-200 hover:text-paper-0"
                    onPointerEnter={showHover}
                    onFocus={hideHover}
                  >
                    {active && <span ref={current} className="nav-current" aria-hidden="true" />}
                    <span className="relative">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
