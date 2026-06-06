import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPostByIdAction, fetchCommentsAction } from "@/app/actions/bizrox";
import PostCard from "@/components/bizrox/PostCard";

type Props = { params: Promise<{ postId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = await fetchPostByIdAction(postId);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.members.name}'s BizRox Post — BNI Miracles`,
    description: post.content.slice(0, 160),
  };
}

export default async function SinglePostPage({ params }: Props) {
  const { postId } = await params;
  const [post, comments] = await Promise.all([
    fetchPostByIdAction(postId),
    fetchCommentsAction(postId),
  ]);

  if (!post) notFound();

  return (
    <>
      <section
        className="px-6 pt-24 pb-6"
        style={{ background: "var(--color-dark)" }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <Link
            href="/bizrox"
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to BizRox
          </Link>
        </div>
      </section>

      <section className="py-8 px-6" style={{ background: "var(--color-bg)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <PostCard post={post} initialComments={comments} expanded={true} />
        </div>
      </section>
    </>
  );
}
