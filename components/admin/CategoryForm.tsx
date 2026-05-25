'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { saveCategoryAction } from '@/app/admin/actions/categories';
import EmojiPicker from './EmojiPicker';
import type { BusinessCategory, CategoryGroup } from '@/lib/supabase';

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary" style={{ opacity: pending ? 0.7 : 1 }}>
      {pending ? 'Saving…' : isEdit ? 'Update Category' : 'Add Category'}
    </button>
  );
}

type Props = {
  category?: BusinessCategory;
  groups: CategoryGroup[];
};

export default function CategoryForm({ category, groups }: Props) {
  const isEdit = !!category;
  const [state, formAction] = useActionState(saveCategoryAction, null);
  const [icon, setIcon] = useState(category?.icon ?? '📦');

  const inputStyle = {
    border: '1.5px solid #E5E7EB', borderRadius: 8,
    padding: '0.75rem 1rem', fontSize: '0.875rem', width: '100%', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.8125rem', fontWeight: 600,
    color: 'var(--color-dark)', marginBottom: 6,
  };

  return (
    <form action={formAction} className="flex flex-col gap-6" style={{ maxWidth: 600 }}>
      {isEdit && <input type="hidden" name="id" value={category.id} />}
      {/* Icon is submitted via hidden input; EmojiPicker manages display */}
      <input type="hidden" name="icon" value={icon} />

      <div className="card p-6">
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--color-dark)' }}>Category Icon</h2>
        <EmojiPicker value={icon} onChange={setIcon} />
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-base mb-5" style={{ color: 'var(--color-dark)' }}>Category Details</h2>
        <div className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label style={labelStyle}>
              Category Name <span style={{ color: 'var(--color-primary)' }}>*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={category?.name}
              placeholder="e.g. Graphic Design"
              style={inputStyle}
            />
          </div>

          {/* Group */}
          <div>
            <label style={labelStyle}>Group</label>
            <select
              name="group_id"
              defaultValue={category?.group_id ?? ''}
              style={{ ...inputStyle, background: 'white' }}
            >
              <option value="">— No group (Ungrouped) —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: 4 }}>
              Groups control how categories are organised on the public site.
            </p>
          </div>

          {/* Sort order */}
          <div>
            <label style={labelStyle}>Sort Order</label>
            <input
              name="sort_order"
              type="number"
              min={0}
              defaultValue={category?.sort_order ?? 0}
              style={{ ...inputStyle, width: 120 }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: 4 }}>
              Lower number = shown first within the group.
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
