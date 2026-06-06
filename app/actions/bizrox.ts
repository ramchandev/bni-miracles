"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getMemberSession } from "@/lib/member-session";
import { sendMemberEmail, emailTemplate } from "@/lib/email";
import { revalidatePath } from "next/cache";
import type {
  PostType,
  MediaType,
  PostWithMember,
  CommentWithMember,
  ReactionSummary,
} from "@/lib/supabase";

/* ── Fetch helpers ───────────────────────────────────────────────────── */

// Posts query — no reactions join (reactions fetched separately to avoid
// cascading failure if the bizrox_reactions table hasn't been created yet)
const POST_SELECT = `
  id, post_type, content, media_url, media_type,
  comments_count, is_active, created_at, member_id,
  members(name, slug, category, profile_picture_url, phone)
`;

const COMMENT_SELECT = `
  id, post_id, content, created_at, member_id,
  members(name, slug, profile_picture_url)
`;

/** Fetch reactions for a list of post IDs. Fails silently if table missing. */
async function fetchReactionsForPosts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  postIds: string[]
): Promise<Record<string, ReactionSummary[]>> {
  if (postIds.length === 0) return {};
  try {
    const { data, error } = await admin
      .from("bizrox_reactions")
      .select("post_id, reaction, member_id")
      .in("post_id", postIds);

    if (error) return {}; // table may not exist yet — silently degrade

    const byPost: Record<string, { reaction: string; member_id: string }[]> = {};
    for (const r of (data ?? []) as { post_id: string; reaction: string; member_id: string }[]) {
      if (!byPost[r.post_id]) byPost[r.post_id] = [];
      byPost[r.post_id].push(r);
    }

    const result: Record<string, ReactionSummary[]> = {};
    for (const [postId, rows] of Object.entries(byPost)) {
      const map = new Map<string, { count: number; memberIds: string[] }>();
      for (const r of rows) {
        if (!map.has(r.reaction)) map.set(r.reaction, { count: 0, memberIds: [] });
        const entry = map.get(r.reaction)!;
        entry.count++;
        entry.memberIds.push(r.member_id);
      }
      result[postId] = [...map.entries()].map(([reaction, { count, memberIds }]) => ({
        reaction, count, memberIds,
      }));
    }
    return result;
  } catch {
    return {};
  }
}

export async function fetchPostsAction(cursor?: string): Promise<{
  posts: PostWithMember[];
  hasMore: boolean;
}> {
  const admin = createSupabaseAdminClient();
  const PAGE  = 12;

  let q = admin
    .from("bizrox_posts")
    .select(POST_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(PAGE + 1);

  if (cursor) q = q.lt("created_at", cursor);

  const { data, error } = await q;

  if (error) {
    console.error("[fetchPostsAction]", error.message);
    return { posts: [], hasMore: false };
  }

  const raw     = (data ?? []) as unknown[];
  const hasMore = raw.length > PAGE;
  const page    = raw.slice(0, PAGE) as Record<string, unknown>[];

  // Fetch reactions separately so a missing table doesn't break posts
  const postIds     = page.map((p) => p.id as string);
  const reactionsMap = await fetchReactionsForPosts(admin, postIds);

  const posts = page.map((p) => ({
    ...p,
    reactions: reactionsMap[p.id as string] ?? [],
  })) as unknown as PostWithMember[];

  return { posts, hasMore };
}

export async function fetchPostByIdAction(postId: string): Promise<PostWithMember | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("bizrox_posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  const reactionsMap = await fetchReactionsForPosts(admin, [postId]);
  return { ...(data as object), reactions: reactionsMap[postId] ?? [] } as unknown as PostWithMember;
}

export async function fetchCommentsAction(
  postId: string
): Promise<CommentWithMember[]> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("bizrox_comments")
    .select(COMMENT_SELECT)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as CommentWithMember[];
}

/* ── Write helpers ───────────────────────────────────────────────────── */

export async function createPostAction(data: {
  post_type: PostType;
  content: string;
  media_url?: string;
  media_type?: MediaType | null;
}): Promise<{ error?: string; postId?: string }> {
  const member = await getMemberSession();
  if (!member) return { error: "Please log in to post." };

  if (!data.content.trim()) return { error: "Post content cannot be empty." };

  const admin = createSupabaseAdminClient();
  const { data: post, error } = await admin
    .from("bizrox_posts")
    .insert({
      member_id:  member.id,
      post_type:  data.post_type,
      content:    data.content.trim(),
      media_url:  data.media_url?.trim() || null,
      media_type: data.media_type ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/bizrox");
  return { postId: (post as { id: string }).id };
}

export async function deletePostAction(
  postId: string
): Promise<{ error?: string }> {
  const member = await getMemberSession();
  if (!member) return { error: "Not authenticated." };

  const admin = createSupabaseAdminClient();

  // Verify ownership (or allow if admin — just member-owned for now)
  const { data: post } = await admin
    .from("bizrox_posts")
    .select("member_id")
    .eq("id", postId)
    .single();

  if (!post || (post.member_id as string) !== member.id) {
    return { error: "You can only delete your own posts." };
  }

  await admin.from("bizrox_posts").update({ is_active: false }).eq("id", postId);

  revalidatePath("/bizrox");
  return {};
}

export async function addCommentAction(
  postId: string,
  content: string
): Promise<{ error?: string; comment?: CommentWithMember }> {
  const member = await getMemberSession();
  if (!member) return { error: "Please log in to comment." };
  if (!content.trim()) return { error: "Comment cannot be empty." };

  const admin = createSupabaseAdminClient();

  const { data: comment, error } = await admin
    .from("bizrox_comments")
    .insert({ post_id: postId, member_id: member.id, content: content.trim() })
    .select(COMMENT_SELECT)
    .single();

  if (error) return { error: error.message };

  // Increment counter
  await admin.rpc("increment_comments_count", { post_id: postId });

  // Email notification to post author
  const { data: post } = await admin
    .from("bizrox_posts")
    .select("content, member_id, members(name, email, phone)")
    .eq("id", postId)
    .single();

  if (post && (post.member_id as string) !== member.id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const author = post.members as any;
    if (author?.email) {
      const waLink = member.phone
        ? `https://wa.me/${(member.phone as string).replace(/\D/g, "")}`
        : "https://wa.me/919841767641";

      sendMemberEmail(
        author.email as string,
        `💬 ${member.name} commented on your BizRox post`,
        emailTemplate("💬 New Comment on Your Post", [
          { label: "Your Post",    value: ((post.content as string) ?? "").slice(0, 120) + "…" },
          { label: "Comment by",  value: member.name },
          { label: "Comment",     value: (content as string) },
          {
            label: "Action",
            value: `<a href="https://bnimiracles.in/bizrox/${postId}" style="color:#C8102E;font-weight:600;">View Post →</a> &nbsp;&nbsp; <a href="${waLink}" style="color:#25D366;font-weight:600;">WhatsApp ${member.name} →</a>`,
          },
        ])
      ).catch(console.error);
    }
  }

  revalidatePath(`/bizrox/${postId}`);
  revalidatePath("/bizrox");
  return { comment: comment as unknown as CommentWithMember };
}

export async function deleteCommentAction(
  commentId: string,
  postId: string
): Promise<{ error?: string }> {
  const member = await getMemberSession();
  if (!member) return { error: "Not authenticated." };

  const admin = createSupabaseAdminClient();

  const { data: c } = await admin
    .from("bizrox_comments")
    .select("member_id")
    .eq("id", commentId)
    .single();

  if (!c || (c.member_id as string) !== member.id) {
    return { error: "You can only delete your own comments." };
  }

  await admin.from("bizrox_comments").delete().eq("id", commentId);
  await admin.rpc("decrement_comments_count", { post_id: postId });

  revalidatePath(`/bizrox/${postId}`);
  revalidatePath("/bizrox");
  return {};
}

/* ── Admin-only actions ──────────────────────────────────────────────── */

export async function adminDeletePostAction(postId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin.from("bizrox_posts").update({ is_active: false }).eq("id", postId);
  revalidatePath("/bizrox");
  revalidatePath("/admin/bizrox");
}

export async function adminDeleteCommentAction(
  commentId: string,
  postId: string
): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin.from("bizrox_comments").delete().eq("id", commentId);
  await admin.rpc("decrement_comments_count", { post_id: postId });
  revalidatePath("/bizrox");
  revalidatePath("/admin/bizrox");
}

/* ── Reactions ───────────────────────────────────────────────────────── */

export async function toggleReactionAction(
  postId: string,
  reaction: string
): Promise<{ error?: string; added: boolean }> {
  const member = await getMemberSession();
  if (!member) return { error: "Please log in to react.", added: false };

  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("bizrox_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("member_id", member.id)
    .eq("reaction", reaction)
    .maybeSingle();

  if (existing) {
    await admin.from("bizrox_reactions").delete().eq("id", existing.id);
    revalidatePath("/bizrox");
    return { added: false };
  } else {
    await admin
      .from("bizrox_reactions")
      .insert({ post_id: postId, member_id: member.id, reaction });
    revalidatePath("/bizrox");
    return { added: true };
  }
}

/* ── Sidebar leaderboard ─────────────────────────────────────────────── */

export type SidebarMember = {
  id: string;
  name: string;
  slug: string;
  profile_picture_url: string | null;
  count: number;
};

export type BizRoxSidebarData = {
  topGivers:       SidebarMember[];
  topPromos:       SidebarMember[];
  topSeekers:      SidebarMember[];
  topContributors: SidebarMember[];
};

export async function fetchBizRoxSidebarAction(): Promise<BizRoxSidebarData> {
  const admin = createSupabaseAdminClient();

  const [postsResult, commentsResult] = await Promise.all([
    admin
      .from("bizrox_posts")
      .select("member_id, post_type, members(id, name, slug, profile_picture_url)")
      .eq("is_active", true),
    admin
      .from("bizrox_comments")
      .select("member_id, members(id, name, slug, profile_picture_url)"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts    = (postsResult.data    ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comments = (commentsResult.data ?? []) as any[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function topN(items: any[], filterFn: (i: any) => boolean, n = 3): SidebarMember[] {
    const counts = new Map<string, { count: number; member: typeof items[0]["members"] }>();
    for (const item of items) {
      if (!filterFn(item)) continue;
      const id = item.member_id as string;
      if (!id) continue;
      if (!counts.has(id)) counts.set(id, { count: 0, member: item.members });
      counts.get(id)!.count++;
    }
    return [...counts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, n)
      .map(([id, { count, member }]) => ({
        id,
        name:                 (member?.name               ?? "Unknown") as string,
        slug:                 (member?.slug               ?? "")        as string,
        profile_picture_url:  (member?.profile_picture_url ?? null)     as string | null,
        count,
      }));
  }

  return {
    topGivers:       topN(posts, (p) => p.post_type === "give"),
    topPromos:       topN(posts, (p) => p.post_type === "promo"),
    topSeekers:      topN(posts, (p) => p.post_type === "need"),
    topContributors: topN(comments, () => true),
  };
}
