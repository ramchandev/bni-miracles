import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { kolkataDateString } from "@/lib/one-on-one";
import type { OneOnOneSlot } from "@/lib/supabase";

export type Plan121Host = {
  id: string;
  name: string;
  slug: string;
  profile_picture_url: string | null;
  category: string;
  is_active?: boolean;
};

export type Plan121Entry = {
  slot: OneOnOneSlot;
  host: Plan121Host;
};

function hostFromJoin(
  raw: Plan121Host | Plan121Host[] | null | undefined
): Plan121Host | null {
  if (!raw) return null;
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row?.id || row.is_active === false) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    profile_picture_url: row.profile_picture_url,
    category: row.category,
  };
}

export async function fetchPlan121Availability(
  viewerMemberId?: string | null
): Promise<Plan121Entry[]> {
  const admin = createSupabaseAdminClient();
  const today = kolkataDateString();

  const [{ data: slotsRaw }, pendingRaw] = await Promise.all([
    admin
      .from("one_on_one_slots")
      .select(
        "*, members!host_member_id(id, name, slug, profile_picture_url, category, is_active)"
      )
      .eq("status", "open")
      .gte("slot_date", today)
      .order("slot_date")
      .order("start_time"),
    viewerMemberId
      ? admin
          .from("one_on_one_requests")
          .select("slot_id")
          .eq("requester_member_id", viewerMemberId)
          .eq("status", "pending")
      : Promise.resolve({ data: [] as { slot_id: string }[] }),
  ]);

  const pendingSlotIds = new Set(
    (pendingRaw.data ?? []).map((r) => r.slot_id as string)
  );

  const out: Plan121Entry[] = [];

  for (const row of slotsRaw ?? []) {
    const record = row as Record<string, unknown>;
    const host = hostFromJoin(record.members as Plan121Host | Plan121Host[] | null);
    if (!host) continue;

    const slotId = record.id as string;
    if (viewerMemberId && host.id === viewerMemberId) continue;
    if (pendingSlotIds.has(slotId)) continue;

    const { members: _m, ...slotFields } = record;
    out.push({
      slot: slotFields as OneOnOneSlot,
      host,
    });
  }

  return out;
}
