'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/admin/actions/auth';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/members', label: 'Members', icon: '👥' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { href: '/admin/registrations', label: 'Registrations', icon: '📅' },
  { href: '/admin/contacts', label: 'Contacts', icon: '✉️' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col w-60 shrink-0 h-screen sticky top-0"
      style={{ background: 'var(--color-dark)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Image src="/BNI-Miracles-Logo.png" alt="BNI Miracles" width={110} height={46} style={{ objectFit: 'contain' }} />
        <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
              }}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <span>🚪</span>
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
