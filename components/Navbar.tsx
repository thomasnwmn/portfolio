"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
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
          <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5 md:flex-nowrap md:gap-7 md:whitespace-nowrap">
            {[
              { label: 'work', href: '/work' },
              { label: 'writing', href: '/blog' },
              { label: 'about', href: '/about' },
              { label: 'contact', href: '/contact' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'page' : undefined}
                  className="nav-link relative text-[13.5px] font-medium tracking-[0.005em] text-paper-1 transition-colors duration-200 hover:text-paper-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
