import Link from "next/link";

type Initiative = {
  tamilName: string;
  englishName: string;
  description: string;
  slug: string;
  icon: string;
};

export default function InitiativeCard({ initiative }: { initiative: Initiative }) {
  return (
    <article className="card p-6 flex flex-col">
      <div className="text-4xl mb-4">{initiative.icon}</div>
      <h3 className="text-base font-bold mb-1" style={{ color: "var(--color-dark)", fontFamily: "Noto Sans Tamil, sans-serif" }}>
        {initiative.tamilName}
      </h3>
      <p className="text-xs font-semibold mb-3" style={{ color: "var(--color-primary)" }}>
        {initiative.englishName}
      </p>
      <p className="text-sm flex-1" style={{ color: "var(--color-gray)", lineHeight: 1.65 }}>
        {initiative.description}
      </p>
      <Link
        href={`/initiatives/${initiative.slug}`}
        className="mt-4 text-sm font-semibold inline-flex items-center gap-1 transition-colors hover:gap-2"
        style={{ color: "var(--color-primary)" }}
      >
        Learn More
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </article>
  );
}

export type { Initiative };
