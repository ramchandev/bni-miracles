"use client";

import { useEffect } from "react";
import { useMemberSession } from "@/components/MemberSessionContext";

type Props = {
  title: string;
  description?: string;
};

export default function MemberPageGate({ title, description }: Props) {
  const { member } = useMemberSession();

  useEffect(() => {
    if (!member) {
      document.dispatchEvent(new CustomEvent("open-login"));
    }
  }, [member]);

  if (member) return null;

  return (
    <section
      className="py-16 px-6 flex items-center justify-center min-h-[40vh]"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto"
          style={{ background: "#FEE2E2" }}
        >
          🔐
        </div>
        <h2 className="text-xl font-extrabold mb-2" style={{ color: "var(--color-dark)" }}>
          Members only
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--color-gray)" }}>
          {description ?? `Log in to access ${title}.`}
        </p>
        <button
          type="button"
          onClick={() => document.dispatchEvent(new CustomEvent("open-login"))}
          className="btn-primary px-8"
        >
          Log In
        </button>
      </div>
    </section>
  );
}
