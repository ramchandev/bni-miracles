"use client";

import { useState } from "react";
import { fetchPostsAction } from "@/app/actions/bizrox";
import PostCard from "@/components/bizrox/PostCard";
import PostComposer from "@/components/bizrox/PostComposer";
import { useMemberSession } from "@/components/MemberSessionContext";
import type { PostWithMember } from "@/lib/supabase";

const TYPE_FILTERS = [
  { value: "", label: "All Posts" },
  { value: "need", label: "🙏 Needs" },
  { value: "give", label: "✅ Gives" },
  { value: "promo", label: "📣 Promos" },
  { value: "announcement", label: "📢 Announcements" },
];

export default function BizRoxFeed({
  initialPosts,
  initialHasMore,
}: {
  initialPosts: PostWithMember[];
  initialHasMore: boolean;
}) {
  const { member }          = useMemberSession();
  const [posts, setPosts]   = useState<PostWithMember[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const last    = posts[posts.length - 1];
    const result  = await fetchPostsAction(last?.created_at);
    setLoading(false);
    setPosts((prev) => [...prev, ...result.posts]);
    setHasMore(result.hasMore);
  };

  const handlePosted = async () => {
    // Refresh first page after new post
    const result = await fetchPostsAction();
    setPosts(result.posts);
    setHasMore(result.hasMore);
  };

  const displayPosts = filter
    ? posts.filter((p) => p.post_type === filter)
    : posts;

  return (
    <div>
      {/* Composer — only for logged-in members */}
      {member && (
        <div className="mb-6">
          <PostComposer onPosted={handlePosted} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: filter === f.value ? "var(--color-dark)" : "#F3F4F6",
              color:      filter === f.value ? "white" : "var(--color-gray)",
              border: "1px solid transparent",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {displayPosts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "white", border: "1px dashed #E5E7EB" }}>
          <p className="text-4xl mb-3">📣</p>
          <p className="font-bold mb-1" style={{ color: "var(--color-dark)" }}>No posts yet</p>
          <p className="text-sm" style={{ color: "var(--color-gray)" }}>
            {member ? "Be the first to post something!" : "Log in to post the first one."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !filter && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn-outline text-sm px-8"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
