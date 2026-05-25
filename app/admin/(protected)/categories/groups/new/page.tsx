import type { Metadata } from 'next';
import Link from 'next/link';
import GroupForm from '@/components/admin/GroupForm';

export const metadata: Metadata = { title: 'Add Group — BNI Miracles Admin' };

export default function NewGroupPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/categories" className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          ← Categories
        </Link>
        <span style={{ color: '#E5E7EB' }}>/</span>
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>Add Group</h1>
      </div>
      <GroupForm />
    </div>
  );
}
