"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export type MemberOption = {
  id: string;
  name: string;
  category: string;
  profile_picture_url: string | null;
};

function Avatar({ member, size = 40 }: { member: { name: string; profile_picture_url: string | null }; size?: number }) {
  if (member.profile_picture_url) {
    return (
      <Image
        src={member.profile_picture_url}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  const parts = member.name.trim().split(" ");
  const initials =
    parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2);
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: "var(--color-primary)",
      }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

type Props = {
  members: MemberOption[];
  value: string | null;
  onChange: (memberId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function MemberAssignPicker({
  members,
  value,
  onChange,
  disabled = false,
  placeholder = "Search member to assign…",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => members.find((m) => m.id === value) ?? null, [members, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }, [members, query]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (id: string | null) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-[260px] max-w-md">
      {selected && !open ? (
        <div
          className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 bg-white"
          style={{ borderColor: "#E5E7EB" }}
        >
          <Avatar member={selected} size={44} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate" style={{ color: "var(--color-dark)" }}>
              {selected.name}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--color-gray)" }}>
              {selected.category}
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setOpen(true)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
              style={{ color: "var(--color-primary)", background: "#FEE2E2" }}
            >
              Change
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => pick(null)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left border border-dashed border-gray-300 bg-white hover:border-gray-400 transition-colors"
          style={{ color: "var(--color-gray)" }}
        >
          <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">+</span>
          Assign member…
        </button>
      )}

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl shadow-xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #E5E7EB" }}
        >
          <div className="p-2 border-b border-gray-100">
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-red-300"
              disabled={disabled}
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 italic"
                style={{ color: "var(--color-gray)" }}
                onClick={() => pick(null)}
              >
                — Unassigned —
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-center" style={{ color: "var(--color-gray)" }}>
                No members match &quot;{query}&quot;
              </li>
            ) : (
              filtered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-red-50 transition-colors"
                    style={{
                      background: m.id === value ? "#FFF1F2" : undefined,
                    }}
                    onClick={() => pick(m.id)}
                  >
                    <Avatar member={m} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--color-dark)" }}>
                        {m.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--color-gray)" }}>
                        {m.category}
                      </p>
                    </div>
                    {m.id === value && (
                      <span className="text-xs font-bold shrink-0" style={{ color: "var(--color-primary)" }}>
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
