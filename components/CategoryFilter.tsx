"use client";

export type CategoryItem = {
  name: string;
  icon: string;
};

export default function CategoryFilter({
  categories,
  selected,
  onChange,
}: {
  categories: CategoryItem[];
  selected: string;
  onChange: (cat: string) => void;
}) {
  const all: CategoryItem = { name: "All", icon: "🏷️" };
  const items = [all, ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((cat) => {
        const active = selected === cat.name;
        return (
          <button
            key={cat.name}
            onClick={() => onChange(cat.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: active ? "var(--color-primary)" : "white",
              color: active ? "white" : "var(--color-dark)",
              border: "1.5px solid",
              borderColor: active ? "var(--color-primary)" : "#E5E7EB",
            }}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
