'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { saveGroupAction } from '@/app/admin/actions/categories';
import type { CategoryGroup } from '@/lib/supabase';

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary" style={{ opacity: pending ? 0.7 : 1 }}>
      {pending ? 'Saving…' : isEdit ? 'Update Group' : 'Add Group'}
    </button>
  );
}

type Props = { group?: CategoryGroup };

export default function GroupForm({ group }: Props) {
  const isEdit = !!group;
  const [state, formAction] = useActionState(saveGroupAction, null);

  const inputStyle = {
    border: '1.5px solid #E5E7EB', borderRadius: 8,
    padding: '0.75rem 1rem', fontSize: '0.875rem', width: '100%', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.8125rem', fontWeight: 600,
    color: 'var(--color-dark)', marginBottom: 6,
  };

  return (
    <form action={formAction} className="flex flex-col gap-6" style={{ maxWidth: 480 }}>
      {isEdit && <input type="hidden" name="id" value={group.id} />}

      <div className="card p-6">
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--color-dark)' }}>Group Details</h2>
        <div className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>
              Group Name <span style={{ color: 'var(--color-primary)' }}>*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={group?.name}
              placeholder="e.g. Finance & Business"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Sort Order</label>
            <input
              name="sort_order"
              type="number"
              min={0}
              defaultValue={group?.sort_order ?? 0}
              style={{ ...inputStyle, width: 120 }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: 4 }}>
              Controls the display order of groups. Lower = first.
            </p>
          </div>
        </div>
      </div>

      {state?.error && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#FEE2E2', color: 'var(--color-primary)' }}>
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton isEdit={isEdit} />
        <a href="/admin/categories" className="btn-outline text-sm">Cancel</a>
      </div>
    </form>
  );
}
