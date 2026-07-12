"use client";

import { useEffect, useRef, useState } from "react";
import { fetchPostsAction } from "@/app/actions/bizrox";
import PostCard from "@/components/bizrox/PostCard";
import PostComposer from "@/components/bizrox/PostComposer";
import { PostCardSkeleton } from "@/components/bizrox/BizRoxFeedSkeleton";
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
  const { member }            = useMemberSession();
  const [posts, setPosts]     = useState<PostWithMember[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter]   = useState("");
  const sentinelRef           = useRef<HTMLDivElement | null>(null);
  const postsRef              = useRef(posts);
  const hasMoreRef            = useRef(hasMore);
  const loadingRef            = useRef(false);

  postsRef.current   = posts;
  hasMoreRef.current = hasMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || filter) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        const last = postsRef.current[postsRef.current.length - 1];
        void fetchPostsAction(last?.created_at)
          .then((result) => {
            setPosts((prev) => [...prev, ...result.posts]);
            setHasMore(result.hasMore);
          })
          .finally(() => {
            loadingRef.current = false;
            setLoading(false);
          });
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, filter, posts.length]);

  const handlePosted = async () => {
    const result = await fetchPostsAction();
    setPosts(result.posts);
    setHasMore(result.hasMore);
  };

  const displayPosts = filter
    ? posts.filter((p) => p.post_type === filter)
    : posts;

  return (
    <div>
      {member && (
        <div className="mb-6">
          <PostComposer onPosted={handlePosted} />
        </div>
      )}

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

      {hasMore && !filter && (
        <div ref={sentinelRef} className="mt-5" aria-busy={loading}>
          {loading ? (
            <div className="flex flex-col gap-5">
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}
    </div>
  );
}
