'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { saveMemberAction } from '@/app/admin/actions/members';
import ImageUploadWidget from './ImageUploadWidget';
import type { Member } from '@/lib/supabase';

type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  group_id: string | null;
  group_name: string | null;
};

function generateSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary" style={{ opacity: pending ? 0.7 : 1 }}>
      {pending ? 'Saving…' : isEdit ? 'Update Member' : 'Add Member'}
    </button>
  );
}

// Dynamic line-item list for Gives / Asks
function LineItems({
  label,
  color,
  name,
  items,
  onChange,
}: {
  label: string;
  color: string;
  name: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  function update(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...items, '']);
  }

  return (
    <div
      className="flex-1 rounded-xl p-5"
      style={{ border: `1.5px solid ${color}44`, background: `${color}08` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: color }}
        >
          {label[0]}
        </div>
        <span className="font-bold text-sm" style={{ color: 'var(--color-dark)' }}>{label}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium ml-auto"
          style={{ background: `${color}22`, color }}
        >
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Hidden input so FormData picks it up with the right name */}
            <input type="hidden" name={name} value={item} />
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={
                label === 'Gives'
                  ? 'e.g. Referrals to IT companies'
                  : 'e.g. Interior design projects'
              }
              className="flex-1 px-3 py-2 text-sm rounded-lg"
              style={{ border: '1.5px solid #E5E7EB', outline: 'none', background: 'white' }}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-lg leading-none"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
        style={{ color, background: `${color}15` }}
      >
        + Add {label === 'Gives' ? 'Give' : 'Ask'}
      </button>
    </div>
  );
}

type Props = {
  member?: Member;
  initialGives?: string[];
  initialAsks?: string[];
  categories?: CategoryOption[];
};

export default function MemberForm({ member, initialGives = [], initialAsks = [], categories = [] }: Props) {
  const isEdit = !!member;
  const [state, formAction] = useActionState(saveMemberAction, null);

  const [name, setName] = useState(member?.name ?? '');
  const [slug, setSlug] = useState(member?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [profileUrl, setProfileUrl] = useState(member?.profile_picture_url ?? '');
  const [gives, setGives] = useState<string[]>(initialGives.length > 0 ? initialGives : ['']);
  const [asks, setAsks] = useState<string[]>(initialAsks.length > 0 ? initialAsks : ['']);

  const nameRef = useRef(name);
  nameRef.current = name;

  // Auto-generate slug from name when not manually edited
  useEffect(() => {
    if (!slugTouched) {
      setSlug(generateSlug(name));
    }
  }, [name, slugTouched]);

  const inputStyle = { border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.875rem', width: '100%', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: 6 };
  const textareaStyle = { ...inputStyle, resize: 'vertical' as const, minHeight: 100, fontFamily: 'inherit' };

  return (
    <form action={formAction}>
      {isEdit && <input type="hidden" name="id" value={member.id} />}
      <input type="hidden" name="profile_picture_url" value={profileUrl} />

      {/* Profile Photo */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-dark)' }}>Profile Photo</h2>
        <ImageUploadWidget
          currentUrl={member?.profile_picture_url ?? null}
          memberName={name}
          onUpload={(url) => setProfileUrl(url)}
        />
      </div>

      {/* Basic Info */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-dark)' }}>Basic Info</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name <span style={{ color: 'var(--color-primary)' }}>*</span></label>
            <input
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              style={inputStyle}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={labelStyle}>URL Slug <span style={{ color: 'var(--color-primary)' }}>*</span></label>
            <input
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
              placeholder="e.g. rajesh-kumar"
              style={inputStyle}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: 4 }}>
              URL: /members/{slug || '…'}
            </p>
          </div>

          {/* Business Name */}
          <div>
            <label style={labelStyle}>Business Name <span style={{ color: 'var(--color-primary)' }}>*</span></label>
            <input
              name="business_name"
              type="text"
              required
              defaultValue={member?.business_name}
              placeholder="e.g. Rajesh Printing Works"
              style={inputStyle}
            />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Business Category <span style={{ color: 'var(--color-primary)' }}>*</span></label>
            <select
              name="category"
              required
              defaultValue={member?.category ?? ''}
              style={{ ...inputStyle, background: 'white' }}
            >
              <option value="">Select a category…</option>
              {categories.length > 0 ? (
                // Group categories by group_name
                Object.entries(
                  categories.reduce<Record<string, CategoryOption[]>>((acc, cat) => {
                    const group = cat.group_name ?? 'Ungrouped';
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(cat);
                    return acc;
                  }, {})
                ).map(([groupName, cats]) => (
                  <optgroup key={groupName} label={groupName}>
                    {cats.map((c) => (
                      <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </optgroup>
                ))
              ) : (
                // Fallback if categories not loaded
                <option value="">Loading categories…</option>
              )}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>WhatsApp / Phone Number</label>
            <input
              name="phone"
              type="tel"
              defaultValue={member?.phone ?? ''}
              placeholder="e.g. +919841234567"
              style={inputStyle}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: 4 }}>
              Include country code (e.g. +91 for India) — shown as a WhatsApp link.
            </p>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Business Location</label>
            <input
              name="business_location"
              type="text"
              defaultValue={member?.business_location ?? ''}
              placeholder="e.g. Anna Nagar, Chennai"
              style={inputStyle}
            />
          </div>

          {/* Website */}
          <div className="md:col-span-2">
            <label style={labelStyle}>Website</label>
            <input
              name="website"
              type="text"
              defaultValue={member?.website ?? ''}
              placeholder="e.g. https://example.com"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Gives & Asks */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-base mb-1" style={{ color: 'var(--color-dark)' }}>Gives &amp; Asks</h2>
        <p className="text-xs mb-5" style={{ color: 'var(--color-gray)' }}>
          What this member can refer to others (Gives) and what kind of referrals they are looking for (Asks).
        </p>
        <div className="flex flex-col md:flex-row gap-5">
          <LineItems
            label="Gives"
            color="#16A34A"
            name="gives"
            items={gives}
            onChange={setGives}
          />
          <LineItems
            label="Asks"
            color="#C8102E"
            name="asks"
            items={asks}
            onChange={setAsks}
          />
        </div>
      </div>

      {/* Profile Details */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-dark)' }}>Profile Details</h2>
        <div className="flex flex-col gap-5">
          <div>
            <label style={labelStyle}>Services / Products Offered</label>
            <textarea
              name="services"
              defaultValue={member?.services ?? ''}
              placeholder="Describe what services or products this member offers…"
              style={textareaStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Why Choose Us</label>
            <textarea
              name="why_choose_us"
              defaultValue={member?.why_choose_us ?? ''}
              placeholder="What makes this member's business unique?"
              style={textareaStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Success Stories</label>
            <textarea
              name="success_stories"
              defaultValue={member?.success_stories ?? ''}
              placeholder="Testimonials or case studies…"
              style={textareaStyle}
            />
          </div>
        </div>
      </div>

      {/* Visibility */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-base mb-3" style={{ color: 'var(--color-dark)' }}>Visibility</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            value="true"
            defaultChecked={member ? member.is_active : true}
            className="w-4 h-4 rounded"
            style={{ accentColor: 'var(--color-primary)' }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--color-dark)' }}>
            Show on public members page
          </span>
        </label>
        <p className="text-xs mt-1.5 ml-7" style={{ color: 'var(--color-gray)' }}>
          Uncheck to hide this member without deleting them.
        </p>
      </div>

      {state?.error && (
        <div className="px-4 py-3 rounded-lg mb-4 text-sm" style={{ background: '#FEE2E2', color: 'var(--color-primary)' }}>
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton isEdit={isEdit} />
        <a href="/admin/members" className="btn-outline text-sm">Cancel</a>
      </div>
    </form>
  );
}
