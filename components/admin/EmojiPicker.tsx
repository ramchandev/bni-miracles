'use client';

import { useState } from 'react';

const EMOJI_GROUPS = [
  {
    label: 'Finance & Business',
    emojis: ['💼', '📊', '💰', '📈', '🏦', '🤝', '💳', '📋', '💹', '🪙', '🛡️', '📉'],
  },
  {
    label: 'Technology',
    emojis: ['💻', '🖥️', '📱', '🖨️', '🔧', '⚙️', '💾', '📡', '🖱️', '⌨️', '🔌', '🎬'],
  },
  {
    label: 'Creative',
    emojis: ['🎨', '📸', '🎭', '✏️', '🖌️', '📷', '🎥', '🖊️', '✍️', '🖼️', '🎪', '🎯'],
  },
  {
    label: 'Manufacturing',
    emojis: ['🏭', '🔨', '🪛', '🏗️', '🧱', '⚒️', '🔩', '🪚', '🛠️', '⚙️', '🪑', '🏛️'],
  },
  {
    label: 'Fashion & Retail',
    emojis: ['👗', '👕', '👠', '🛍️', '💄', '🪞', '💎', '🧣', '👒', '🕶️', '👜', '🧴'],
  },
  {
    label: 'Nature & Energy',
    emojis: ['🌾', '🌿', '🌱', '☀️', '💧', '♻️', '🔋', '🌊', '🦜', '🌻', '🌳', '⚡'],
  },
  {
    label: 'Health & Care',
    emojis: ['🦷', '💊', '🏥', '🩺', '❤️', '💪', '🧘', '🩹', '🔬', '🌡️', '🧬', '🫀'],
  },
  {
    label: 'Legal & Professional',
    emojis: ['⚖️', '📜', '📝', '🗂️', '🔏', '📌', '🗃️', '📂', '🔐', '🏛️', '✒️', '📃'],
  },
  {
    label: 'Real Estate',
    emojis: ['🏠', '🏢', '🏡', '🔑', '🏘️', '🌆', '🚪', '🌇', '🏙️', '🪟', '🏗️', '🌃'],
  },
  {
    label: 'Transport & Services',
    emojis: ['✈️', '🚗', '🚢', '🧳', '🚚', '📦', '🚛', '🛤️', '🛡️', '🔒', '📷', '🗺️'],
  },
  {
    label: 'People & Education',
    emojis: ['👥', '🐾', '🎓', '📚', '🎯', '🏆', '🌍', '👮', '🔍', '🎖️', '🧑‍🏫', '🤝'],
  },
];

type Props = {
  value: string;
  onChange: (emoji: string) => void;
};

export default function EmojiPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger row */}
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
          style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB' }}
        >
          {value || '📦'}
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type or pick an emoji →"
            className="w-full px-3 py-2.5 text-sm rounded-lg mb-1.5"
            style={{ border: '1.5px solid #E5E7EB', outline: 'none' }}
          />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: open ? 'var(--color-primary)' : '#F3F4F6', color: open ? 'white' : 'var(--color-dark)' }}
          >
            {open ? 'Close picker' : 'Browse emojis'}
          </button>
        </div>
      </div>

      {/* Emoji grid */}
      {open && (
        <div
          className="mt-3 rounded-xl overflow-hidden"
          style={{ border: '1.5px solid #E5E7EB', background: 'white', maxHeight: 360, overflowY: 'auto' }}
        >
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-gray)' }}>
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { onChange(emoji); setOpen(false); }}
                    className="w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: value === emoji ? 'var(--color-primary)' : '#F9FAFB',
                      border: value === emoji ? '2px solid var(--color-primary)' : '1.5px solid #E5E7EB',
                    }}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
