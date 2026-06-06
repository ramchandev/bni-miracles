"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { addCommentAction, deleteCommentAction } from "@/app/actions/bizrox";
import { useMemberSession } from "@/components/MemberSessionContext";
import type { CommentWithMember } from "@/lib/supabase";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60)  return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function CommentAvatar({ name, photo }: { name: string; photo: string | null }) {
  if (photo) return (
    <Image src={photo} alt={name} width={28} height={28}
      className="rounded-full object-cover shrink-0" style={{ width: 28, height: 28 }} />
  );
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-white text-xs font-bold"
      style={{ background: "var(--color-primary)" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function CommentSection({
  postId,
  initialComments,
  onCountChange,
}: {
  postId: string;
  initialComments: CommentWithMember[];
  onCountChange?: (n: number) => void;
}) {
  const { member } = useMemberSession();
  const [comments, setComments] = useState<CommentWithMember[]>(initialComments);
  const [text, setText]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    const result = await addCommentAction(postId, text);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else if (result.comment) {
      setComments((prev) => [...prev, result.comment!]);
      onCountChange?.(comments.length + 1);
      setText("");
    }
  };

  const remove = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    await deleteCommentAction(commentId, postId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    onCountChange?.(Math.max(0, comments.length - 1));
  };

  return (
    <div className="mt-1">
      {/* Comment list */}
      {comments.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 items-start group">
              <CommentAvatar name={c.members.name} photo={c.members.profile_picture_url} />
              <div className="flex-1 min-w-0 rounded-xl px-3 py-2" style={{ background: "#F9FAFB" }}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <Link href={`/members/${c.members.slug}`}
                    className="text-xs font-bold hover:underline"
                    style={{ color: "var(--color-dark)" }}>
                    {c.members.name}
                  </Link>
                  <span className="text-xs" style={{ color: "var(--color-gray)" }}>
                    {timeAgo(c.created_at)}
                  </span>
                  {member?.id === c.member_id && (
                    <button
                      onClick={() => remove(c.id)}
                      className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "#EF4444" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--color-gray)" }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment */}
      {member ? (
        <form onSubmit={submit} className="flex gap-2 items-start">
          <CommentAvatar name={member.name} photo={member.profile_picture_url} />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-200"
              style={{ border: "1.5px solid #E5E7EB" }}
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-opacity"
              style={{
                background: "var(--color-primary)",
                color: "white",
                opacity: submitting || !text.trim() ? 0.5 : 1,
              }}
            >
              Post
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs" style={{ color: "var(--color-gray)" }}>
          <button className="underline font-semibold" style={{ color: "var(--color-primary)" }}
            onClick={() => document.dispatchEvent(new CustomEvent("open-login"))}>
            Log in
          </button>{" "}
          to add a comment.
        </p>
      )}

      {error && (
        <p className="text-xs mt-2" style={{ color: "#EF4444" }}>{error}</p>
      )}
    </div>
  );
}
