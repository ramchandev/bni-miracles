"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import GivesAsksCategoryLineItems from "@/components/GivesAsksCategoryLineItems";
import MemberCollaborationSection from "@/components/members/MemberCollaborationSection";
import type { GiveAskEntry } from "@/lib/gives-asks-categories";
import type { MemberCollaborations } from "@/lib/gives-asks-collaboration";
import {
  saveGivesAsksAction,
  type GivesAsksBasicMember,
} from "@/app/actions/gives-asks";
import type { GivesAsksCategory } from "@/lib/supabase";

type Props = {
  categories: GivesAsksCategory[];
  member: GivesAsksBasicMember;
  gives: GiveAskEntry[];
  asks: GiveAskEntry[];
  collaborations: MemberCollaborations;
};

export default function GivesAsksClient({
  categories,
  member,
  gives: initialGives,
  asks: initialAsks,
  collaborations: initialCollaborations,
}: Props) {
  const [gives, setGives] = useState<GiveAskEntry[]>(initialGives);
  const [asks, setAsks] = useState<GiveAskEntry[]>(initialAsks);
  const [collaborations, setCollaborations] = useState(initialCollaborations);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await saveGivesAsksAction(
      member.id,
      member.slug,
      gives.filter((g) => g.text.trim()),
      asks.filter((a) => a.text.trim())
    );
    setSaving(false);
    if (res.error) setError(res.error);
    else {
      setSaved(true);
      const { fetchMemberCollaborationsAction } = await import("@/app/actions/gives-asks");
      setCollaborations(await fetchMemberCollaborationsAction(member.id));
    }
  };

  return (
    <>
      <section
        className="px-6 text-center"
        style={{ background: "var(--color-dark)", paddingTop: 100, paddingBottom: 48 }}
      >
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-3"
          style={{ color: "var(--color-accent)" }}
        >
          Member Self-Service
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">My Gives &amp; Asks</h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          Update what you can give and what you need — see who you can collaborate with.
        </p>
      </section>

      <section className="py-12 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            className="flex items-center gap-4 rounded-2xl p-5 mb-6"
            style={{ background: "white", border: "1.5px solid #E5E7EB" }}
          >
            {member.profile_picture_url ? (
              <Image
                src={member.profile_picture_url}
                alt={member.name}
                width={56}
                height={56}
                className="rounded-full object-cover shrink-0"
                style={{ width: 56, height: 56 }}
              />
            ) : (
              <div
                className="flex items-center justify-center rounded-full shrink-0 text-white font-bold text-xl"
                style={{ width: 56, height: 56, background: "var(--color-primary)" }}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-extrabold" style={{ color: "var(--color-dark)" }}>
                Hi, {member.name.split(" ")[0]}! 👋
              </p>
              <p className="text-sm" style={{ color: "var(--color-gray)" }}>
                {member.category} · Update what you give and what you need.
              </p>
            </div>
            <Link
              href={`/members/${member.slug}`}
              className="ml-auto text-xs font-semibold shrink-0 px-3 py-1.5 rounded-lg"
              style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
            >
              View Profile →
            </Link>
          </div>

          <form onSubmit={save} className="flex flex-col gap-6">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl p-4" style={{ background: "#ECFDF5", border: "1px solid #86EFAC" }}>
                <p className="font-bold mb-1" style={{ color: "#166534" }}>✅ What are Gives?</p>
                <p style={{ color: "#15803D" }}>
                  Referrals you can confidently pass to others — pick the types of leads you can introduce.
                </p>
              </div>
              <div className="rounded-xl p-4" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
                <p className="font-bold mb-1" style={{ color: "#991B1B" }}>🙏 What are Asks?</p>
                <p style={{ color: "#B91C1C" }}>
                  The referral types you&apos;re actively looking for — choose from the chapter categories.
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 flex flex-col gap-8"
              style={{ background: "white", border: "1.5px solid #E5E7EB" }}
            >
              <GivesAsksCategoryLineItems
                label="Gives"
                emoji="✅"
                accentColor="#16A34A"
                kind="give"
                textFieldName="gives"
                categoryFieldName="give_categories"
                categories={categories}
                items={gives}
                onChange={setGives}
                textPlaceholder="e.g. VJN Systems"
              />
              <div style={{ borderTop: "1px solid #F3F4F6" }} />
              <GivesAsksCategoryLineItems
                label="Asks"
                emoji="🙏"
                accentColor="#DC2626"
                kind="ask"
                textFieldName="asks"
                categoryFieldName="ask_categories"
                categories={categories}
                items={asks}
                onChange={setAsks}
                textPlaceholder="e.g. New homeowners in OMR"
              />
            </div>

            <MemberCollaborationSection collaborations={collaborations} compact />

            <div className="rounded-xl px-5 py-4 text-xs" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <p className="font-semibold mb-1" style={{ color: "var(--color-dark)" }}>💡 Tips for better referrals</p>
              <ul className="list-disc list-inside space-y-1" style={{ color: "var(--color-gray)" }}>
                <li>Enter the company or contact name, then pick a referral type from the dropdown.</li>
                <li>Add 3–5 gives and 3–5 asks — variety helps chapter members spot opportunities faster.</li>
                <li>Update monthly as your business needs shift.</li>
              </ul>
            </div>

            {saved && (
              <div
                className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold"
                style={{ background: "#DCFCE7", color: "#166534" }}
              >
                <span className="text-xl">✅</span>
                <div>
                  <p>Saved successfully!</p>
                  <Link href={`/members/${member.slug}`} className="text-xs font-normal underline" style={{ color: "#15803D" }}>
                    View your updated public profile →
                  </Link>
                </div>
              </div>
            )}

            {error && (
              <div
                className="flex gap-2 items-start px-4 py-3 rounded-lg text-sm"
                style={{ background: "#FEE2E2", color: "#991B1B" }}
              >
                <span className="shrink-0">❌</span> {error}
              </div>
            )}

            <div className="flex items-center gap-4 flex-wrap">
              <button type="submit" disabled={saving} className="btn-primary px-10" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "💾 Save Gives & Asks"}
              </button>
              <Link href={`/members/${member.slug}`} className="text-sm" style={{ color: "var(--color-gray)" }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
