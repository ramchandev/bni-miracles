import type { Metadata } from 'next';
import Image from 'next/image';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = { title: 'Admin Login — BNI Miracles' };

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/logo.webp" alt="BNI Miracles" width={140} height={60} style={{ objectFit: 'contain', margin: '0 auto' }} />
          <p className="text-sm font-semibold mt-2" style={{ color: 'var(--color-gray)' }}>
            Admin Panel
          </p>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-dark)' }}>
            Welcome back
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-gray)' }}>
            Sign in to manage BNI Miracles members and data.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
