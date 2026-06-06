"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPostAction } from "@/app/actions/bizrox";
import { uploadBizRoxImageAction } from "@/app/actions/bizrox-upload";
import { useMemberSession } from "@/components/MemberSessionContext";
import { detectMedia } from "@/lib/media-detect";
import type { PostType, MediaType } from "@/lib/supabase";

const POST_TYPES: { value: PostType; emoji: string; label: string; color: string; bg: string }[] = [
  { value: "need",         emoji: "🙏", label: "I Need",       color: "#DC2626", bg: "#FEE2E2" },
  { value: "give",         emoji: "✅", label: "I Can Give",   color: "#16A34A", bg: "#DCFCE7" },
  { value: "promo",        emoji: "📣", label: "Promo",        color: "#7C3AED", bg: "#EDE9FE" },
  { value: "announcement", emoji: "📢", label: "Announcement", color: "#2563EB", bg: "#DBEAFE" },
];

export default function PostComposer({ onPosted }: { onPosted?: () => void }) {
  const { member }       = useMemberSession();
  const router           = useRouter();
  const [open, setOpen]  = useState(false);
  const [postType, setPostType] = useState<PostType>("give");
  const [content, setContent]  = useState("");
  const [mediaInput, setMediaInput] = useState("");
  const [mediaUrl, setMediaUrl]     = useState("");
  const [mediaType, setMediaType]   = useState<MediaType | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!member) return null;

  const handleMediaInput = (url: string) => {
    setMediaInput(url);
    if (!url.trim()) { setMediaUrl(""); setMediaType(null); return; }
    const detected = detectMedia(url);
    if (detected.type === "youtube") {
      setMediaUrl(detected.embedUrl);
      setMediaType("youtube");
      setImagePreview(null);
    } else if (detected.type === "instagram") {
      setMediaUrl(detected.originalUrl);
      setMediaType("instagram");
      setImagePreview(null);
    } else {
      setMediaUrl("");
      setMediaType(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local blob preview immediately
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadBizRoxImageAction(fd);
      if (result.error) throw new Error(result.error);
      setMediaUrl(result.url!);
      setMediaType("image");
      setMediaInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed. Please try again.");
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearMedia = () => {
    setMediaInput(""); setMediaUrl(""); setMediaType(null); setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("Please write something first."); return; }
    setSubmitting(true);
    setError("");
    const result = await createPostAction({
      post_type: postType,
      content,
      media_url: mediaUrl || undefined,
      media_type: mediaType,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setContent(""); clearMedia(); setOpen(false);
      onPosted?.();
      router.refresh();
    }
  };

  const currentType = POST_TYPES.find((t) => t.value === postType)!;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #E5E7EB" }}>
      {/* Collapsed trigger */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 w-full px-5 py-4 text-left transition-colors hover:bg-gray-50"
        >
          {member.profile_picture_url ? (
            <Image src={member.profile_picture_url} alt={member.name} width={40} height={40}
              className="rounded-full object-cover shrink-0" style={{ width: 40, height: 40 }} />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 text-white font-bold"
              style={{ background: "var(--color-primary)" }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="flex-1 text-sm rounded-full px-4 py-2.5"
            style={{ background: "#F3F4F6", color: "var(--color-gray)" }}>
            Share something with the chapter, {member.name.split(" ")[0]}…
          </span>
          <span className="text-xs font-semibold px-3 py-2 rounded-full"
            style={{ background: "var(--color-primary)", color: "white" }}>
            + Post
          </span>
        </button>
      ) : (
        /* Expanded composer */
        <form onSubmit={submit} className="p-5 flex flex-col gap-4">
          {/* Type selector */}
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setPostType(t.value)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: postType === t.value ? t.bg : "#F3F4F6",
                  color: postType === t.value ? t.color : "var(--color-gray)",
                  border: `1.5px solid ${postType === t.value ? t.color + "40" : "#E5E7EB"}`,
                }}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What ${currentType.label.toLowerCase()}? Be specific so members know how to help…`}
            rows={3}
            required
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
            style={{ border: "1.5px solid #E5E7EB" }}
          />

          {/* Media section */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold" style={{ color: "var(--color-gray)" }}>
              Add Media (optional)
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {/* URL input */}
              <div>
                <input
                  type="text"
                  value={mediaInput}
                  onChange={(e) => handleMediaInput(e.target.value)}
                  placeholder="Paste YouTube / Instagram URL…"
                  className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none"
                  style={{ border: "1.5px solid #E5E7EB" }}
                />
                {mediaType === "youtube" && (
                  <p className="text-xs mt-1" style={{ color: "#16A34A" }}>✅ YouTube video detected</p>
                )}
                {mediaType === "instagram" && (
                  <p className="text-xs mt-1" style={{ color: "#7C3AED" }}>✅ Instagram link detected</p>
                )}
              </div>

              {/* Image upload */}
              <div>
                <label
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors hover:bg-gray-50"
                  style={{ border: "1.5px dashed #E5E7EB", color: "var(--color-gray)" }}
                >
                  📷 {uploading ? "Uploading…" : "Upload Photo"}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Preview */}
            {imagePreview && (
              <div className="relative inline-block">
                <Image src={imagePreview} alt="Preview" width={200} height={120}
                  className="rounded-xl object-cover" style={{ maxHeight: 120 }} />
                <button type="button" onClick={clearMedia}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(0,0,0,0.6)", color: "white" }}>✕</button>
              </div>
            )}
            {(mediaType === "youtube" || mediaType === "instagram") && (
              <button type="button" onClick={clearMedia}
                className="self-start text-xs underline" style={{ color: "#EF4444" }}>
                Remove media
              </button>
            )}
          </div>

          {error && (
            <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="btn-primary text-sm px-6"
              style={{ opacity: submitting || uploading ? 0.7 : 1 }}
            >
              {submitting ? "Posting…" : "Post to BizRox"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setContent(""); clearMedia(); setError(""); }}
              className="text-sm" style={{ color: "var(--color-gray)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
