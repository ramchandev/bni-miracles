'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { saveMemberAction } from '@/app/admin/actions/members';
import GivesAsksCategoryLineItems from '@/components/GivesAsksCategoryLineItems';
import ImageUploadWidget from './ImageUploadWidget';
import type { GiveAskEntry } from '@/lib/gives-asks-categories';
import type { GivesAsksCategory, Member } from '@/lib/supabase';

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

type Props = {
  member?: Member;
  initialGives?: GiveAskEntry[];
  initialAsks?: GiveAskEntry[];
  categories?: CategoryOption[];
  givesAsksCategories?: GivesAsksCategory[];
};

export default function MemberForm({
  member,
  initialGives = [],
  initialAsks = [],
  categories = [],
  givesAsksCategories = [],
}: Props) {
  const isEdit = !!member;
  const [state, formAction] = useActionState(saveMemberAction, null);

  const [name, setName] = useState(member?.name ?? '');
  const [slug, setSlug] = useState(member?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [profileUrl, setProfileUrl] = useState(member?.profile_picture_url ?? '');
  const [gives, setGives] = useState<GiveAskEntry[]>(initialGives);
  const [asks, setAsks] = useState<GiveAskEntry[]>(initialAsks);

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

          {/* Email */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              name="email"
              type="email"
              defaultValue={member?.email ?? ''}
              placeholder="e.g. you@yourbusiness.com"
              style={inputStyle}
              autoComplete="email"
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: 4 }}>
              Shown on the public member profile with a mail link.
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
          Pick referral categories this member can give and what they are looking for.
        </p>
        <div className="flex flex-col md:flex-row gap-5">
          <GivesAsksCategoryLineItems
            label="Gives"
            emoji="✅"
            accentColor="#16A34A"
            kind="give"
            textFieldName="gives"
            categoryFieldName="give_categories"
            categories={givesAsksCategories}
            items={gives}
            onChange={setGives}
            textPlaceholder="e.g. VJN Systems"
            compact
          />
          <GivesAsksCategoryLineItems
            label="Asks"
            emoji="🙏"
            accentColor="#C8102E"
            kind="ask"
            textFieldName="asks"
            categoryFieldName="ask_categories"
            categories={givesAsksCategories}
            items={asks}
            onChange={setAsks}
            textPlaceholder="e.g. Hardware retailers"
            compact
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
