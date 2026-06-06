"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { deletePostAction } from "@/app/actions/bizrox";
import { useMemberSession } from "@/components/MemberSessionContext";
import MediaEmbed from "@/components/bizrox/MediaEmbed";
import CommentSection from "@/components/bizrox/CommentSection";
import ReactionBar from "@/components/bizrox/ReactionBar";
import type { PostWithMember, CommentWithMember } from "@/lib/supabase";

/* ── Badge config ────────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  need:         { emoji: "🙏", label: "I Need",       bg: "#FEE2E2", color: "#DC2626" },
  give:         { emoji: "✅", label: "I Can Give",   bg: "#DCFCE7", color: "#16A34A" },
  promo:        { emoji: "📣", label: "Promo",        bg: "#EDE9FE", color: "#7C3AED" },
  announcement: { emoji: "📢", label: "Announcement", bg: "#DBEAFE", color: "#2563EB" },
} as const;

function timeAgo(dateStr: string): string {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function PostCard({
  post,
  initialComments = [],
  expanded = false,
}: {
  post: PostWithMember;
  initialComments?: CommentWithMember[];
  expanded?: boolean;
}) {
  const { member }        = useMemberSession();
  const [commentsOpen, setCommentsOpen] = useState(expanded);
  const [count, setCount] = useState(post.comments_count);
  const [deleted, setDeleted] = useState(false);

  const badge = TYPE_CONFIG[post.post_type] ?? TYPE_CONFIG.promo;
  const m     = post.members;
  const waLink = m.phone
    ? `https://wa.me/${m.phone.replace(/\D/g, "")}`
    : "https://wa.me/919841767641";

  if (deleted) return null;

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    await deletePostAction(post.id);
    setDeleted(true);
  };

  return (
    <article
      className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        {/* Avatar */}
        <Link href={`/members/${m.slug}`} className="shrink-0">
          {m.profile_picture_url ? (
            <Image
              src={m.profile_picture_url} alt={m.name}
              width={44} height={44}
              className="rounded-full object-cover"
              style={{ width: 44, height: 44 }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-full text-white font-bold"
              style={{ width: 44, height: 44, background: "var(--color-primary)", fontSize: 16 }}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/members/${m.slug}`}
              className="font-bold text-sm hover:underline" style={{ color: "var(--color-dark)" }}>
              {m.name}
            </Link>
            <span className="text-xs" style={{ color: "var(--color-gray)" }}>·</span>
            <span className="text-xs" style={{ color: "var(--color-gray)" }}>{m.category}</span>
          </div>
          <p className="text-xs" style={{ color: "var(--color-gray)" }}>{timeAgo(post.created_at)}</p>
        </div>

        {/* Badge + owner delete */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.emoji} {badge.label}
          </span>
          {member?.id === post.member_id && (
            <button
              onClick={handleDelete}
              title="Delete post"
              className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-red-50"
              style={{ color: "#EF4444", border: "1px solid #FECACA" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-dark)" }}>
          {post.content}
        </p>
      </div>

      {/* Media */}
      {post.media_url && post.media_type && (
        <div className="px-5 pb-3">
          <MediaEmbed mediaUrl={post.media_url} mediaType={post.media_type} />
        </div>
      )}

      {/* Reaction bar */}
      <ReactionBar postId={post.id} initialReactions={post.reactions ?? []} />

      {/* Actions bar */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{ borderTop: "1px solid #F3F4F6" }}
      >
        <button
          onClick={() => setCommentsOpen((o) => !o)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors hover:bg-gray-50"
          style={{ color: commentsOpen ? "#7C3AED" : "var(--color-gray)" }}
        >
          💬 {count} {count === 1 ? "Comment" : "Comments"}
        </button>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors hover:opacity-90 ml-auto"
          style={{ background: "#25D366", color: "white" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Connect on WhatsApp
        </a>
      </div>

      {/* Comments section */}
      {commentsOpen && (
        <div className="px-5 pb-5" style={{ borderTop: "1px solid #F3F4F6" }}>
          <CommentSection
            postId={post.id}
            initialComments={initialComments}
            onCountChange={setCount}
          />
        </div>
      )}
    </article>
  );
}
