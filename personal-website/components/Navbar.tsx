import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-ink-0/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-y-2 px-6 py-3 md:flex-row md:items-baseline md:justify-between md:gap-6 md:px-10 md:py-4">
        <Link href="/" className="group flex shrink-0 items-baseline gap-3 no-underline">
          <span className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.02em] text-paper-0">
            thomas<span className="text-chrome-mid">newman</span>
          </span>
          <span className="hidden text-[12px] text-paper-2 transition-colors group-hover:text-paper-1 lg:inline">
            software engineer
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
                  className="relative text-[13.5px] font-medium tracking-[0.005em] text-paper-1 transition-colors duration-200 hover:text-paper-0 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gradient-to-r after:from-chrome-lo after:via-chrome-hi after:to-chrome-lo after:transition-all after:duration-300 hover:after:w-full"
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
