"use client";

import type { GivesAsksCategory } from "@/lib/supabase";
import type { GiveAskEntry } from "@/lib/gives-asks-categories";
import { filterCategoriesForTypeAlphabetical } from "@/lib/gives-asks-categories";
import GivesAsksCategoryPicker from "@/components/GivesAsksCategoryPicker";

const fieldStyle = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  borderRadius: 8,
  border: "1.5px solid #E5E7EB",
  fontSize: 14,
  outline: "none",
  background: "#fff",
} as const;

type Props = {
  label: string;
  emoji: string;
  accentColor: string;
  kind: "give" | "ask";
  textFieldName: string;
  categoryFieldName: string;
  categories: GivesAsksCategory[];
  items: GiveAskEntry[];
  onChange: (items: GiveAskEntry[]) => void;
  textPlaceholder?: string;
  compact?: boolean;
};

export default function GivesAsksCategoryLineItems({
  label,
  emoji,
  accentColor,
  kind,
  textFieldName,
  categoryFieldName,
  categories,
  items,
  onChange,
  textPlaceholder = "e.g. VJN Systems",
  compact = false,
}: Props) {
  const options = filterCategoriesForTypeAlphabetical(categories, kind);

  const updateText = (index: number, text: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, text } : item)));
  };

  const updateCategory = (index: number, categoryId: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, categoryId } : item)));
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...items, { text: "", categoryId: "" }]);
  };

  const filledCount = items.filter((item) => item.text.trim() || item.categoryId).length;

  return (
    <div
      className={compact ? "flex-1 rounded-xl p-5" : "flex flex-col gap-3"}
      style={
        compact
          ? { border: `1.5px solid ${accentColor}44`, background: `${accentColor}08` }
          : undefined
      }
    >
      <div className="flex items-center gap-2" style={compact ? { marginBottom: 12 } : undefined}>
        {compact ? (
          <>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: accentColor }}
            >
              {label[0]}
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--color-dark)" }}>
              {label}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium ml-auto"
              style={{ background: `${accentColor}22`, color: accentColor }}
            >
              {filledCount} item{filledCount !== 1 ? "s" : ""}
            </span>
          </>
        ) : (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg w-full"
            style={{ background: accentColor + "12" }}
          >
            <span className="text-lg">{emoji}</span>
            <p className="text-sm font-extrabold" style={{ color: accentColor }}>
              {label}
            </p>
            <span
              className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: accentColor, color: "#fff" }}
            >
              {filledCount}
            </span>
          </div>
        )}
      </div>

      <div className={`flex flex-col gap-3 ${compact ? "" : "pl-1"}`}>
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-3"
            style={{ background: compact ? "white" : `${accentColor}08`, border: `1px solid ${accentColor}22` }}
          >
            <input type="hidden" name={textFieldName} value={item.text} />
            <input type="hidden" name={categoryFieldName} value={item.categoryId} />

            <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--color-gray)" }}>
                  {label.endsWith("s") ? label.slice(0, -1) : label}
                </label>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateText(i, e.target.value)}
                  placeholder={textPlaceholder}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--color-gray)" }}>
                  Type
                </label>
                <GivesAsksCategoryPicker
                  options={options}
                  value={item.categoryId}
                  onChange={(categoryId) => updateCategory(i, categoryId)}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                title="Remove"
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors hover:bg-red-50 mb-0.5"
                style={{ color: "var(--color-primary)", border: "1.5px solid #FCA5A5" }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs italic pl-1" style={{ color: "var(--color-gray)" }}>
            No {label.toLowerCase()} added yet.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={add}
        className={
          compact
            ? "mt-3 text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
            : "self-start flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
        }
        style={{
          background: accentColor + "15",
          color: accentColor,
          border: `1px solid ${accentColor}40`,
        }}
      >
        + Add {label.endsWith("s") ? label.slice(0, -1) : label}
      </button>
    </div>
  );
}
