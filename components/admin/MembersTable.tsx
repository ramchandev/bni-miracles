'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toggleMemberActiveAction, deleteMemberAction } from '@/app/admin/actions/members';
import type { Member } from '@/lib/supabase';

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const ini = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ background: 'var(--color-primary)' }}
    >
      {ini.toUpperCase()}
    </div>
  );
}

export default function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleMemberActiveAction(id, !current);
      router.refresh();
    });
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteMemberAction(id);
      router.refresh();
    });
  }

  if (!members.length) {
    return (
      <div className="card p-12 text-center">
        <p className="text-4xl mb-3">👥</p>
        <p className="font-semibold" style={{ color: 'var(--color-dark)' }}>No members yet</p>
        <p className="text-sm mt-1 mb-5" style={{ color: 'var(--color-gray)' }}>Add your first member to get started.</p>
        <Link href="/admin/members/new" className="btn-primary text-sm">+ Add Member</Link>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-gray)' }}>Member</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-gray)' }}>Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-gray)' }}>Location</th>
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-gray)' }}>Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-gray)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.id} style={{ borderBottom: i < members.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {m.profile_picture_url ? (
                      <Image
                        src={m.profile_picture_url}
                        alt={m.name}
                        width={36}
                        height={36}
                        className="rounded-full object-cover shrink-0"
                        style={{ width: 36, height: 36 }}
                      />
                    ) : (
                      <Initials name={m.name} />
                    )}
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-dark)' }}>{m.name}</div>
                      <div className="text-xs" style={{ color: 'var(--color-gray)' }}>{m.business_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#FEE2E2', color: 'var(--color-primary)' }}>
                    {m.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-gray)' }}>
                  {m.business_location || '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggle(m.id, m.is_active)}
                    className="text-xs px-2.5 py-1 rounded-full font-semibold transition-colors"
                    style={{
                      background: m.is_active ? '#DCFCE7' : '#F3F4F6',
                      color: m.is_active ? '#166534' : '#6B7280',
                    }}
                  >
                    {m.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/members/${m.id}/edit`}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors hover:bg-gray-100"
                      style={{ color: 'var(--color-dark)' }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors hover:bg-red-50"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
