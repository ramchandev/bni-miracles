import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { adminDeletePostAction, adminDeleteCommentAction } from "@/app/actions/bizrox";

export const metadata: Metadata = { title: "BizRox Moderation — BNI Miracles Admin" };

const TYPE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  need:         { label: "Need",         bg: "#FEE2E2", color: "#DC2626" },
  give:         { label: "Give",         bg: "#DCFCE7", color: "#16A34A" },
  promo:        { label: "Promo",        bg: "#EDE9FE", color: "#7C3AED" },
  announcement: { label: "Announcement", bg: "#DBEAFE", color: "#2563EB" },
};

function Avatar({ name, photo }: { name: string; photo: string | null }) {
  if (photo) return (
    <Image src={photo} alt={name} width={32} height={32}
      className="rounded-full object-cover shrink-0" style={{ width: 32, height: 32 }} />
  );
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-white text-xs font-bold"
      style={{ background: "var(--color-primary)" }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function timeStr(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function AdminBizRoxPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch all posts (including inactive) for moderation
  const { data: postsRaw } = await supabase
    .from("bizrox_posts")
    .select("id, post_type, content, media_type, comments_count, is_active, created_at, member_id, members(name, slug, profile_picture_url)")
    .order("created_at", { ascending: false });

  // Fetch all comments
  const { data: commentsRaw } = await supabase
    .from("bizrox_comments")
    .select("id, post_id, content, created_at, member_id, members(name, slug, profile_picture_url)")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts    = (postsRaw    ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comments = (commentsRaw ?? []) as any[];

  const activePosts   = posts.filter((p) => p.is_active);
  const inactivePosts = posts.filter((p) => !p.is_active);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-dark)" }}>
          📣 BizRox Moderation
        </h1>
        <p className="text-sm" style={{ color: "var(--color-gray)" }}>
          Manage all member posts and comments. Deleted posts are soft-deleted (hidden from feed).
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Active Posts",   value: activePosts.length,   bg: "#DCFCE7", color: "#166534" },
          { label: "Hidden Posts",   value: inactivePosts.length, bg: "#FEE2E2", color: "#991B1B" },
          { label: "Total Comments", value: comments.length,      bg: "#EDE9FE", color: "#5B21B6" },
          { label: "Total Posts",    value: posts.length,         bg: "#F3F4F6", color: "#374151" },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className="rounded-xl p-4 text-center" style={{ background: bg }}>
            <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Active Posts ──────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-lg font-extrabold mb-4" style={{ color: "var(--color-dark)" }}>
          Active Posts
        </h2>
        {activePosts.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-gray)" }}>No active posts.</p>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
            {activePosts.map((post, i) => {
              const badge = TYPE_BADGE[post.post_type] ?? TYPE_BADGE.promo;
              return (
                <div
                  key={post.id}
                  className="flex items-start gap-4 px-5 py-4"
                  style={{ borderBottom: i < activePosts.length - 1 ? "1px solid #F3F4F6" : "none", background: "white" }}
                >
                  <Avatar name={post.members?.name ?? "?"} photo={post.members?.profile_picture_url ?? null} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Link href={`/members/${post.members?.slug}`}
                        className="text-sm font-bold hover:underline" style={{ color: "var(--color-dark)" }}>
                        {post.members?.name}
                      </Link>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-gray)" }}>
                        {timeStr(post.created_at)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-gray)" }}>
                        💬 {post.comments_count}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: "var(--color-gray)" }}>
                      {post.content}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/bizrox/${post.id}`}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                      style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
                      target="_blank">
                      View
                    </Link>
                    <form action={adminDeletePostAction.bind(null, post.id)}>
                      <button type="submit"
                        className="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors hover:bg-red-50"
                        style={{ border: "1px solid #FECACA", color: "#DC2626" }}
                        onClick={(e) => { if (!confirm("Hide this post?")) e.preventDefault(); }}>
                        Hide
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Comments ──────────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-lg font-extrabold mb-4" style={{ color: "var(--color-dark)" }}>
          All Comments
        </h2>
        {comments.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-gray)" }}>No comments yet.</p>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
            {comments.map((c, i) => (
              <div
                key={c.id}
                className="flex items-start gap-4 px-5 py-4"
                style={{ borderBottom: i < comments.length - 1 ? "1px solid #F3F4F6" : "none", background: "white" }}
              >
                <Avatar name={c.members?.name ?? "?"} photo={c.members?.profile_picture_url ?? null} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link href={`/members/${c.members?.slug}`}
                      className="text-sm font-bold hover:underline" style={{ color: "var(--color-dark)" }}>
                      {c.members?.name}
                    </Link>
                    <span className="text-xs" style={{ color: "var(--color-gray)" }}>
                      on post · {timeStr(c.created_at)}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: "var(--color-gray)" }}>
                    {c.content}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/bizrox/${c.post_id}`}
                    className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                    style={{ background: "#F3F4F6", color: "var(--color-gray)" }}
                    target="_blank">
                    View
                  </Link>
                  <form action={adminDeleteCommentAction.bind(null, c.id, c.post_id)}>
                    <button type="submit"
                      className="text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors hover:bg-red-50"
                      style={{ border: "1px solid #FECACA", color: "#DC2626" }}
                      onClick={(e) => { if (!confirm("Delete this comment?")) e.preventDefault(); }}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Hidden Posts ─────────────────────────────────────────────── */}
      {inactivePosts.length > 0 && (
        <section>
          <h2 className="text-lg font-extrabold mb-4" style={{ color: "var(--color-dark)" }}>
            Hidden Posts ({inactivePosts.length})
          </h2>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E5E7EB", opacity: 0.6 }}>
            {inactivePosts.map((post, i) => (
              <div
                key={post.id}
                className="flex items-center gap-4 px-5 py-3"
                style={{ borderBottom: i < inactivePosts.length - 1 ? "1px solid #F3F4F6" : "none", background: "#F9FAFB" }}
              >
                <span className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: "#E5E7EB", color: "var(--color-gray)" }}>Hidden</span>
                <p className="text-sm flex-1 truncate" style={{ color: "var(--color-gray)" }}>
                  {post.members?.name} · {post.content.slice(0, 80)}
                </p>
                <span className="text-xs shrink-0" style={{ color: "var(--color-gray)" }}>
                  {timeStr(post.created_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
