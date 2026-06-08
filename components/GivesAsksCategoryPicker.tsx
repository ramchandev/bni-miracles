"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createGivesAsksCategoryQuickAction } from "@/app/admin/actions/gives-asks-categories";
import type { GivesAsksCategory, GivesAsksCategoryType } from "@/lib/supabase";

type MenuPosition = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "top" | "bottom";
};

const MENU_GAP = 4;
const VIEWPORT_PADDING = 8;
const MENU_MAX_HEIGHT = 320;

type Props = {
  options: GivesAsksCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  allowCreate?: boolean;
  defaultCreateType?: GivesAsksCategoryType;
  onCategoryCreated?: (category: GivesAsksCategory) => void;
};

const TYPE_OPTIONS: { value: GivesAsksCategoryType; label: string }[] = [
  { value: "both", label: "Give & Ask" },
  { value: "give", label: "Give only" },
  { value: "ask", label: "Ask only" },
];

export default function GivesAsksCategoryPicker({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Search type…",
  allowCreate = false,
  defaultCreateType = "both",
  onCategoryCreated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<GivesAsksCategoryType>(defaultCreateType);
  const [createError, setCreateError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => options.find((c) => c.id === value) ?? null, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((c) => c.name.toLowerCase().includes(q));
  }, [options, query]);

  const queryTrimmed = query.trim();
  const showCreateFromSearch =
    allowCreate &&
    queryTrimmed.length > 0 &&
    !options.some((c) => c.name.toLowerCase() === queryTrimmed.toLowerCase());

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
      setShowCreateForm(false);
      setCreateError(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? MENU_MAX_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const openUp = spaceBelow < Math.min(menuHeight, MENU_MAX_HEIGHT) && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      140,
      openUp ? Math.min(MENU_MAX_HEIGHT, spaceAbove - MENU_GAP) : Math.min(MENU_MAX_HEIGHT, spaceBelow - MENU_GAP)
    );

    setMenuPosition({
      left: rect.left,
      width: rect.width,
      maxHeight,
      placement: openUp ? "top" : "bottom",
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + MENU_GAP }
        : { top: rect.bottom + MENU_GAP }),
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();
    const raf = requestAnimationFrame(updateMenuPosition);

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition, showCreateForm, filtered.length, query, allowCreate]);

  useEffect(() => {
    if (showCreateForm && !newName && queryTrimmed) {
      setNewName(queryTrimmed);
    }
  }, [showCreateForm, newName, queryTrimmed]);

  useEffect(() => {
    if (open) setNewType(defaultCreateType);
  }, [open, defaultCreateType]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setShowCreateForm(false);
    setNewName("");
    setCreateError(null);
  };

  const pick = (id: string) => {
    onChange(id);
    close();
  };

  const openCreateForm = (prefill?: string) => {
    setShowCreateForm(true);
    setCreateError(null);
    if (prefill) setNewName(prefill);
    else if (queryTrimmed) setNewName(queryTrimmed);
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) {
      setCreateError("Enter a category name.");
      return;
    }

    setCreateError(null);
    startTransition(async () => {
      const result = await createGivesAsksCategoryQuickAction(name, newType);
      if (result.error) {
        setCreateError(result.error);
        return;
      }
      if (result.category) {
        onCategoryCreated?.(result.category);
        pick(result.category.id);
      }
    });
  };

  const fieldStyle = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    borderRadius: 8,
    border: "1.5px solid #E5E7EB",
    fontSize: 14,
    outline: "none",
    background: "#fff",
  } as const;

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.65rem",
    borderRadius: 6,
    border: "1px solid #E5E7EB",
    fontSize: 13,
    outline: "none",
  } as const;

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || pending}
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left flex items-center justify-between gap-2"
        style={{
          ...fieldStyle,
          color: selected ? "var(--color-dark)" : "var(--color-gray)",
          opacity: pending ? 0.7 : 1,
        }}
      >
        <span className="truncate">{selected ? selected.name : "Select type…"}</span>
        <span className="text-xs shrink-0" style={{ color: "var(--color-gray)" }}>
          {pending ? "…" : open ? "▲" : "▼"}
        </span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="rounded-xl shadow-xl overflow-hidden flex flex-col"
            style={{
              position: "fixed",
              zIndex: 9999,
              left: menuPosition?.left ?? 0,
              width: menuPosition?.width ?? buttonRef.current?.offsetWidth ?? 240,
              maxHeight: menuPosition?.maxHeight ?? MENU_MAX_HEIGHT,
              top: menuPosition?.placement === "bottom" ? menuPosition.top : undefined,
              bottom: menuPosition?.placement === "top" ? menuPosition.bottom : undefined,
              visibility: menuPosition ? "visible" : "hidden",
              background: "#fff",
              border: "1px solid #E5E7EB",
            }}
          >
            {!showCreateForm ? (
              <>
                <div className="p-2 border-b border-gray-100 shrink-0">
                  <input
                    type="search"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-red-300"
                    disabled={disabled || pending}
                  />
                </div>
                <ul className="overflow-y-auto py-1 min-h-0 flex-1">
                  <li>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 italic"
                      style={{ color: "var(--color-gray)" }}
                      onClick={() => pick("")}
                    >
                      — No type —
                    </button>
                  </li>
                  {filtered.length === 0 && !showCreateFromSearch ? (
                    <li className="px-3 py-4 text-sm text-center" style={{ color: "var(--color-gray)" }}>
                      No types match &quot;{query}&quot;
                    </li>
                  ) : (
                    filtered.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 transition-colors"
                          style={{
                            background: c.id === value ? "#FFF1F2" : undefined,
                            color: "var(--color-dark)",
                            fontWeight: c.id === value ? 600 : 400,
                          }}
                          onClick={() => pick(c.id)}
                        >
                          {c.name}
                          {c.id === value ? " ✓" : ""}
                        </button>
                      </li>
                    ))
                  )}
                  {showCreateFromSearch && (
                    <li className="border-t border-gray-100">
                      <button
                        type="button"
                        className="w-full px-3 py-2.5 text-left text-sm font-semibold hover:bg-green-50 transition-colors"
                        style={{ color: "#166534" }}
                        onClick={() => openCreateForm(queryTrimmed)}
                      >
                        + Add &quot;{queryTrimmed}&quot;
                      </button>
                    </li>
                  )}
                </ul>
                {allowCreate && (
                  <div className="border-t border-gray-100 p-2 shrink-0">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      style={{ color: "var(--color-primary)" }}
                      onClick={() => openCreateForm()}
                    >
                      + Add new category
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 flex flex-col gap-2 overflow-y-auto min-h-0">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-gray)" }}>
                  New category
                </p>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Category name"
                  style={inputStyle}
                  autoFocus
                  disabled={pending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreate();
                    }
                  }}
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as GivesAsksCategoryType)}
                  style={inputStyle}
                  disabled={pending}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {createError && (
                  <p className="text-xs font-medium" style={{ color: "#991B1B" }}>
                    {createError}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={pending}
                    className="flex-1 text-xs font-bold px-3 py-2 rounded-lg text-white"
                    style={{ background: "var(--color-primary)", opacity: pending ? 0.7 : 1 }}
                  >
                    {pending ? "Creating…" : "Create & select"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreateError(null);
                    }}
                    disabled={pending}
                    className="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    style={{ color: "var(--color-gray)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
