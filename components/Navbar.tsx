"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, useReducedMotion, type Transition } from 'motion/react';
import { motionTokens } from '@/components/arc/lib/motion-tokens';

const links = [
  { label: 'work', href: '/work' },
  { label: 'writing', href: '/blog' },
  { label: 'about', href: '/about' },
  { label: 'contact', href: '/contact' },
];

// Arc's site header glide: a duration-based spring restated as stiffness and
// damping, so a highlight retargeted mid-flight keeps its velocity.
const root = 2 * Math.PI / (0.3 * 1.2);
const GLIDE: Transition = { type: 'spring', stiffness: root * root, damping: 2 * (1 - 0.1) * root, mass: 1 };
const STILL: Transition = { duration: 0 };

export default function Navbar() {
  const pathname = usePathname();
  const reduced = !!useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
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
        <nav aria-label="Primary" className="min-w-0">
          <ul className="nav-list flex flex-wrap items-baseline gap-y-1.5 md:flex-nowrap md:gap-2 md:whitespace-nowrap" onPointerLeave={() => setHovered(null)}>
            {links.map((link) => {
              const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={current ? 'page' : undefined}
                    className="nav-link relative text-[13.5px] font-medium tracking-[0.005em] text-paper-1 transition-colors duration-200 hover:text-paper-0"
                    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(link.href); }}
                    onFocus={() => setHovered(null)}
                  >
                    {hovered === link.href && <motion.span layoutId="nav-hover" className="nav-hover" transition={reduced ? STILL : GLIDE} aria-hidden="true" />}
                    {current && <motion.span layoutId="nav-current" className="nav-current" transition={reduced ? STILL : motionTokens.spring.morph} aria-hidden="true" />}
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
