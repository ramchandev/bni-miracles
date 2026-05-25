'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/admin/actions/auth';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-dark)' }}>
          Email
        </label>
        <input
          name="email"
          type="email"
          placeholder="admin@bnimiracles.in"
          required
          autoComplete="email"
          className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
          style={{ border: '1.5px solid #E5E7EB', focusRingColor: 'var(--color-primary)' } as React.CSSProperties}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-dark)' }}>
          Password
        </label>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
          style={{ border: '1.5px solid #E5E7EB' }}
        />
      </div>

      {state?.error && (
        <p
          className="text-sm px-4 py-3 rounded-lg"
          style={{ background: '#FEE2E2', color: 'var(--color-primary)' }}
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full text-center py-3"
        style={{ opacity: pending ? 0.7 : 1 }}
      >
        {pending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
