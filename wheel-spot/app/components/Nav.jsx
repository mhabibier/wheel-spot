'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  {
    href: '/home',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5"/>
        <path d="M5 9.5V21h14V9.5"/>
      </svg>
    ),
  },
  {
    href: '/find',
    label: 'Find',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="m20 20-3.5-3.5"/>
      </svg>
    ),
  },
  {
    href: '/news',
    label: 'News',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="2"/>
        <path d="M3 9h18M8 3v3M16 3v3"/>
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottomnav" aria-label="Navigasi utama">
      <div className="bottomnav__inner">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="navitem"
            aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function TopBar({ title, backHref, showLogo = false }) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        {backHref ? (
          <Link className="backlink" href={backHref}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6l-6 6 6 6"/>
            </svg>
            Wheel Spot
          </Link>
        ) : (
          <Link className="topbar__title" href="/home">
            {showLogo && (
              <span className="logo">
                <Image src="/logo.png" alt="Wheel Spot" width={34} height={34} style={{objectFit:'contain'}}/>
              </span>
            )}
            {title || 'Wheel Spot'}
          </Link>
        )}
        <span className="topbar__spacer"/>
        <Link className="avatar" href="/profile" aria-label="Profil saya">WS</Link>
      </div>
    </header>
  );
}
