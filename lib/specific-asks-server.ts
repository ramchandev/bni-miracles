import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendPushToAllMembers } from "@/lib/push-server";
import { formatMeetingLong, type SpecificAskStatus } from "@/lib/specific-asks";
import type {
  AskConnector,
  DirectoryMember,
  OpenAskOption,
  SpecificAskCard,
  SpecificAskMeeting,
} from "@/lib/specific-asks";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

const OCT1 = "2026-10-01";

type SeedRow = {
  position: number;
  seekerSlug: string;
  ask: string;
  connectors: { slug?: string; name: string }[];
  status: SpecificAskStatus;
  notes: string | null;
};

const OCT1_ROWS: SeedRow[] = [
  { position: 1, seekerSlug: "hema", ask: "Spar Super market Egattur", connectors: [{ slug: "parikshit-surana", name: "Parikshit Surana" }], status: "not_yet_connected", notes: null },
  { position: 2, seekerSlug: "uma-shankar", ask: "Sec TNCA", connectors: [{ slug: "sudharson", name: "Sudharson" }], status: "not_yet_connected", notes: null },
  { position: 3, seekerSlug: "vadivelan-vadamadurai", ask: "Dell TVS, Mr. ShivaKumar", connectors: [{ slug: "kousik-sai", name: "Kousik Sai" }], status: "not_yet_connected", notes: null },
  { position: 4, seekerSlug: "ajeeth-elancheziyan", ask: "Project Head TVS Emerald", connectors: [{ slug: "uma-shankar", name: "Uma Shankar" }], status: "not_yet_connected", notes: null },
  { position: 5, seekerSlug: "narendra-balaji", ask: "DHL Procurement Manager", connectors: [{ name: "CNR" }], status: "not_yet_connected", notes: null },
  { position: 6, seekerSlug: "vimalraj", ask: "KVT Site Manager Vadaperumbakaam", connectors: [{ slug: "narendra-balaji", name: "Narendra Balaji" }], status: "contacted", notes: null },
  { position: 7, seekerSlug: "dr-kamisetty-nagendra-kumar", ask: "Dr Prem Kumar, Chennai Diabetic Center, Poonamallee", connectors: [{ slug: "gokul-dass-sridhar", name: "Gokul Dass Sridhar" }], status: "not_yet_connected", notes: null },
  { position: 8, seekerSlug: "auxilia-christy-", ask: "Bahwan CyberTek - Manager", connectors: [{ slug: "tamilarasan", name: "Tamilarasan" }], status: "not_yet_connected", notes: null },
  { position: 9, seekerSlug: "parasuraman", ask: "CEO of Indi Labs Numgambakkam", connectors: [{ name: "CNR" }], status: "not_yet_connected", notes: null },
  { position: 10, seekerSlug: "sudharson", ask: "Animal Welfare Association Head Ms. Shurthi", connectors: [{ name: "CNR" }], status: "not_yet_connected", notes: null },
  { position: 11, seekerSlug: "naushad-ahmed", ask: "Jacob Matthew Director @ TABLO NOIR", connectors: [{ slug: "kousik-sai", name: "Kousik Sai" }], status: "not_yet_connected", notes: "Can connect with Design Agency" },
  { position: 12, seekerSlug: "nithya-kumaran", ask: "Pothys Chennai Silks Purchase Manager", connectors: [{ slug: "kirubakar", name: "Kirubakar" }], status: "not_yet_connected", notes: "Can connect with Seeman Tex" },
  { position: 13, seekerSlug: "subha-selvam", ask: "HR Manager - Team Outings", connectors: [{ slug: "kirubakar", name: "Kirubakar" }, { slug: "ram", name: "Ramachandran S" }], status: "not_yet_connected", notes: "Can try with couple of HRs" },
  { position: 14, seekerSlug: "job-peter", ask: "Mr. Hannu Reddy of Hannu Reality", connectors: [{ slug: "uma-shankar", name: "Uma Shankar" }], status: "not_yet_connected", notes: null },
  { position: 15, seekerSlug: "gokul-dass-sridhar", ask: "Principal Spartans School Mogaippar", connectors: [{ name: "CNR" }], status: "not_yet_connected", notes: null },
];

export function specificAskBizroxContent(askText: string, askId: string, meetingDate: string): string {
  return [
    `Specific Ask: ${askText.trim()}`,
    ``,
    `Raised on ${formatMeetingLong(meetingDate)}. If you can make this connection, open Specific Asks and tap “I can connect”.`,
    ``,
    `[View Specific Ask](/specific-asks?ask=${askId})`,
  ].join("\n");
}

export async function publishSpecificAskToBizrox(params: {
  admin: Admin;
  seekerMemberId: string;
  seekerName: string;
  askId: string;
  askText: string;
  meetingDate: string;
  createdAt?: string;
  notify: boolean;
}): Promise<string | null> {
  const content = specificAskBizroxContent(params.askText, params.askId, params.meetingDate);
  const { data: post, error } = await params.admin
    .from("bizrox_posts")
    .insert({
      member_id: params.seekerMemberId,
      post_type: "need",
      content,
      ...(params.createdAt ? { created_at: params.createdAt } : {}),
    })
    .select("id")
    .single();

  if (error || !post) {
    console.error("[publishSpecificAskToBizrox]", error?.message);
    return null;
  }

  const postId = post.id as string;
  if (params.notify) {
    await sendPushToAllMembers(
      {
        title: `${params.seekerName} has a specific ask`,
        body: params.askText.trim().slice(0, 120),
        href: `/bizrox/${postId}`,
        tag: `specific-ask-${params.askId}`,
      },
      { excludeMemberId: params.seekerMemberId }
    );
  }

  return postId;
}

async function seedOctober1(admin: Admin): Promise<void> {
  const { data: existing, error: existingError } = await admin
    .from("specific_ask_meetings")
    .select("id")
    .eq("meeting_date", OCT1)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing) return;

  const slugs = new Set<string>();
  for (const row of OCT1_ROWS) {
    slugs.add(row.seekerSlug);
    for (const c of row.connectors) {
      if (c.slug) slugs.add(c.slug);
    }
  }

  const { data: members, error: membersError } = await admin
    .from("members")
    .select("id, name, slug")
    .in("slug", [...slugs]);

  if (membersError) throw new Error(membersError.message);

  const bySlug = new Map((members ?? []).map((m) => [m.slug as string, m]));

  const { data: meeting, error: meetingError } = await admin
    .from("specific_ask_meetings")
    .insert({ meeting_date: OCT1 })
    .select("id")
    .single();

  if (meetingError || !meeting) throw new Error(meetingError?.message ?? "Could not create 1 Oct meeting.");

  const meetingId = meeting.id as string;

  for (const row of OCT1_ROWS) {
    const seeker = bySlug.get(row.seekerSlug);
    if (!seeker) {
      console.error("[seedOctober1] missing seeker", row.seekerSlug);
      continue;
    }

    const { data: ask, error: askError } = await admin
      .from("specific_asks")
      .insert({
        seeker_member_id: seeker.id,
        ask_text: row.ask,
        first_asked_on: OCT1,
        status: row.status,
        notes: row.notes,
        created_at: "2026-10-01T04:30:00.000Z",
      })
      .select("id")
      .single();

    if (askError || !ask) {
      console.error("[seedOctober1] ask", askError?.message);
      continue;
    }

    const askId = ask.id as string;

    await admin.from("specific_ask_meeting_links").insert({
      ask_id: askId,
      meeting_id: meetingId,
      position: row.position,
    });

    for (const connector of row.connectors) {
      const member = connector.slug ? bySlug.get(connector.slug) : undefined;
      await admin.from("specific_ask_connectors").insert({
        ask_id: askId,
        member_id: member?.id ?? null,
        display_name: (member?.name as string) ?? connector.name,
      });
    }

    const postId = await publishSpecificAskToBizrox({
      admin,
      seekerMemberId: seeker.id as string,
      seekerName: seeker.name as string,
      askId,
      askText: row.ask,
      meetingDate: OCT1,
      createdAt: "2026-10-01T04:30:00.000Z",
      notify: false,
    });

    if (postId) {
      await admin.from("specific_asks").update({ bizrox_post_id: postId }).eq("id", askId);
    }
  }
}

type RawMember = {
  id: string;
  name: string;
  slug: string | null;
  profile_picture_url: string | null;
  category?: string | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function fetchSpecificAsksBoard(): Promise<{
  meetings: SpecificAskMeeting[];
  asksByDate: Record<string, SpecificAskCard[]>;
  members: DirectoryMember[];
  setupError: string | null;
}> {
  const admin = createSupabaseAdminClient();

  try {
    await seedOctober1(admin);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load specific asks.";
    if (/specific_ask_meetings|schema cache|does not exist/i.test(message)) {
      return {
        meetings: [],
        asksByDate: {},
        members: [],
        setupError:
          "Specific Asks tables are not in the database yet. Run supabase/migrations/20261008120000_specific_asks.sql in the Supabase SQL editor, then refresh.",
      };
    }
    console.error("[fetchSpecificAsksBoard] seed", message);
  }

  const [{ data: meetings, error: meetingsError }, { data: members }] = await Promise.all([
    admin
      .from("specific_ask_meetings")
      .select("id, meeting_date")
      .order("meeting_date", { ascending: false }),
    admin
      .from("members")
      .select("id, name, slug, category, profile_picture_url")
      .eq("is_active", true)
      .order("name"),
  ]);

  if (meetingsError) {
    const missing = /specific_ask_meetings|schema cache|does not exist/i.test(meetingsError.message);
    return {
      meetings: [],
      asksByDate: {},
      members: [],
      setupError: missing
        ? "Specific Asks tables are not in the database yet. Run supabase/migrations/20261008120000_specific_asks.sql in the Supabase SQL editor, then refresh."
        : meetingsError.message,
    };
  }

  const meetingRows = (meetings ?? []) as { id: string; meeting_date: string }[];
  const meetingById = new Map(meetingRows.map((m) => [m.id, m.meeting_date.slice(0, 10)]));

  const asksByDate: Record<string, SpecificAskCard[]> = {};
  for (const m of meetingRows) {
    asksByDate[m.meeting_date.slice(0, 10)] = [];
  }

  if (meetingRows.length > 0) {
    const { data: links, error: linksError } = await admin
      .from("specific_ask_meeting_links")
      .select(
        `
        meeting_id,
        position,
        specific_asks (
          id,
          ask_text,
          first_asked_on,
          status,
          connected_at,
          notes,
          seeker_notes,
          seeker:members!specific_asks_seeker_member_id_fkey (
            id, name, slug, profile_picture_url, category
          ),
          specific_ask_connectors (
            id, member_id, display_name,
            members ( id, name, slug, profile_picture_url )
          )
        )
      `
      )
      .in("meeting_id", meetingRows.map((m) => m.id));

    if (linksError) console.error("[fetchSpecificAsksBoard] links", linksError.message);

    for (const link of links ?? []) {
      const date = meetingById.get(link.meeting_id as string);
      const ask = one(link.specific_asks as RawAsk | RawAsk[] | null);
      if (!date || !ask) continue;
      const seeker = one(ask.seeker);
      if (!seeker) continue;

      const connectors: AskConnector[] = (ask.specific_ask_connectors ?? []).map((c) => {
        const member = one(c.members);
        return {
          id: c.id,
          memberId: c.member_id,
          name: member?.name ?? c.display_name,
          slug: member?.slug ?? null,
          profilePictureUrl: member?.profile_picture_url ?? null,
        };
      });

      asksByDate[date].push({
        id: ask.id,
        seeker: {
          id: seeker.id,
          name: seeker.name,
          slug: seeker.slug,
          profilePictureUrl: seeker.profile_picture_url,
          category: seeker.category,
        },
        askText: ask.ask_text,
        firstAskedOn: String(ask.first_asked_on).slice(0, 10),
        status: ask.status,
        connectedAt: ask.connected_at,
        notes: ask.notes,
        seekerNotes: ask.seeker_notes,
        connectors,
        position: link.position as number,
      });
    }

    for (const date of Object.keys(asksByDate)) {
      asksByDate[date].sort((a, b) => a.position - b.position);
    }
  }

  return {
    meetings: meetingRows.map((m) => ({
      id: m.id,
      meetingDate: m.meeting_date.slice(0, 10),
    })),
    asksByDate,
    members: ((members ?? []) as RawMember[]).map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug ?? "",
      category: m.category ?? null,
      profilePictureUrl: m.profile_picture_url,
    })),
    setupError: null,
  };
}

type RawAsk = {
  id: string;
  ask_text: string;
  first_asked_on: string;
  status: SpecificAskStatus;
  connected_at: string | null;
  notes: string | null;
  seeker_notes: string | null;
  seeker: RawMember | RawMember[] | null;
  specific_ask_connectors: {
    id: string;
    member_id: string | null;
    display_name: string;
    members: RawMember | RawMember[] | null;
  }[];
};

export async function fetchOpenAsksForMember(memberId: string): Promise<OpenAskOption[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("specific_asks")
    .select("id, ask_text, first_asked_on, status")
    .eq("seeker_member_id", memberId)
    .neq("status", "connected")
    .order("first_asked_on", { ascending: true });

  if (error) {
    console.error("[fetchOpenAsksForMember]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    askText: row.ask_text as string,
    firstAskedOn: String(row.first_asked_on).slice(0, 10),
    status: row.status as SpecificAskStatus,
  }));
}
