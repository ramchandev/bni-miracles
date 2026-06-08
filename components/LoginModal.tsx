"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginMemberAction } from "@/app/actions/session";
import { useMemberSession } from "@/components/MemberSessionContext";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone]   = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const { setMember }       = useMemberSession();
  const router              = useRouter();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await loginMemberAction(phone, answer);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    } else {
      setMember(result.member);
      onClose();
      router.refresh(); // refresh server components to pick up session
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ background: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors hover:bg-gray-100"
          style={{ color: "var(--color-gray)" }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 mx-auto"
          style={{ background: "#FEE2E2" }}
        >
          🔐
        </div>

        <h2
          className="text-xl font-extrabold text-center mb-1"
          style={{ color: "var(--color-dark)" }}
        >
          Member Login
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: "var(--color-gray)" }}>
          Access BizRox, Gives &amp; Asks, your profile, and the Dance Card.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Phone */}
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: "var(--color-dark)" }}
            >
              Phone Number <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9841767641 or +91 98417 67641"
              required
              className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              style={{ border: "1.5px solid #E5E7EB" }}
            />
          </div>

          {/* Security Q */}
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: "var(--color-dark)" }}
            >
              Our Usual Meeting Place{" "}
              <span style={{ color: "var(--color-primary)" }}>*</span>
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Hotel name…"
              required
              className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              style={{ border: "1.5px solid #E5E7EB" }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--color-gray)" }}>
              Not case sensitive.
            </p>
          </div>

          {error && (
            <div
              className="flex gap-2 items-start px-4 py-3 rounded-lg text-sm"
              style={{ background: "#FEE2E2", color: "#991B1B" }}
            >
              <span className="shrink-0">❌</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-1"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Verifying…" : "Log In →"}
          </button>
        </form>
      </div>
    </div>
  );
}
