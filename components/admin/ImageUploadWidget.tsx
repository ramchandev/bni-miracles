'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type Props = {
  currentUrl: string | null;
  memberName: string;
  onUpload: (url: string) => void;
};

export default function ImageUploadWidget({ currentUrl, memberName, onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = memberName
    ? memberName.trim().split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  async function handleFile(file: File) {
    setError('');
    // local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('member-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('member-avatars')
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-5">
      {/* Avatar */}
      <div className="relative shrink-0">
        {preview ? (
          <Image
            src={preview}
            alt="Profile photo"
            width={80}
            height={80}
            className="rounded-full object-cover"
            style={{ width: 80, height: 80 }}
            unoptimized={preview.startsWith('blob:')}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: 'var(--color-primary)' }}
          >
            {initials}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <span className="text-white text-xs font-semibold">...</span>
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-outline text-sm"
          style={{ padding: '0.5rem 1rem' }}
        >
          {uploading ? 'Uploading…' : preview ? 'Change Photo' : 'Upload Photo'}
        </button>
        <p className="text-xs mt-1.5" style={{ color: 'var(--color-gray)' }}>
          JPEG, PNG or WEBP · Max 5 MB
        </p>
        {error && <p className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
    </div>
  );
}
