import Link from "next/link";
import { respond121ByTokenAction } from "@/app/actions/one-on-one";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ action?: string }>;
};

export const metadata = {
  title: "1-2-1 Response — BNI Miracles",
  robots: { index: false },
};

export default async function Respond121Page({ params, searchParams }: Props) {
  const { token } = await params;
  const { action } = await searchParams;

  if (action !== "accept" && action !== "decline") {
    return (
      <ResultShell
        title="Invalid link"
        message="This link is missing an action. Use Accept or Decline from your email."
        variant="error"
      />
    );
  }

  const result = await respond121ByTokenAction(token, action);

  if (result.error && !result.requestId) {
    return (
      <ResultShell title="Link not found" message={result.error} variant="error" />
    );
  }

  if (result.error) {
    return (
      <ResultShell
        title={action === "accept" ? "Already handled" : "Already handled"}
        message={result.error}
        variant="neutral"
      />
    );
  }

  return (
    <ResultShell
      title={action === "accept" ? "1-2-1 accepted" : "1-2-1 declined"}
      message={
        action === "accept"
          ? "The meeting is confirmed. The requester has been notified by email."
          : "The requester has been notified. The slot is open again for others to book."
      }
      variant={action === "accept" ? "success" : "neutral"}
    />
  );
}

function ResultShell({
  title,
  message,
  variant,
}: {
  title: string;
  message: string;
  variant: "success" | "error" | "neutral";
}) {
  const bg =
    variant === "success" ? "#DCFCE7" : variant === "error" ? "#FEE2E2" : "#F3F4F6";
  const border =
    variant === "success" ? "#16A34A" : variant === "error" ? "#C8102E" : "#D1D5DB";

  return (
    <section className="py-24 px-6 min-h-[50vh] flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center"
        style={{ background: bg, border: `1.5px solid ${border}33` }}
      >
        <h1 className="text-2xl font-extrabold mb-3" style={{ color: "var(--color-dark)" }}>
          {title}
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-gray)" }}>
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/my-121" className="btn-primary text-sm">
            My 1-2-1 Calendar
          </Link>
          <Link href="/members" className="btn-outline text-sm">
            Browse members
          </Link>
        </div>
      </div>
    </section>
  );
}
