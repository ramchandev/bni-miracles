"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import {
  exportSpecificAsksAction,
  listOpenAsksAction,
  logSpecificAskAction,
  updateSpecificAskDetailsAction,
  updateSpecificAskSeekerNotesAction,
  updateSpecificAskStatusAction,
  volunteerSpecificAskAction,
} from "@/app/actions/specific-asks";
import { useMemberSession } from "@/components/MemberSessionContext";
import {
  askedAgoLabel,
  connectedInLabel,
  daysBetween,
  formatMeetingLong,
  kolkataToday,
  meetingParts,
  openForLabel,
  type DirectoryMember,
  type OpenAskOption,
  type SpecificAskCard,
  type SpecificAskMeeting,
  type SpecificAskStatus,
} from "@/lib/specific-asks";

type Filter = "all" | "connected" | "not_connected";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "connected", label: "Connected" },
  { id: "not_connected", label: "Not Connected" },
];

const STATUS_BUTTONS: { value: SpecificAskStatus; label: string; emoji: string }[] = [
  { value: "not_yet_connected", label: "Not Yet Connected", emoji: "⏳" },
  { value: "connected", label: "Connected", emoji: "✅" },
];

const BURST = ["❤️", "🎉", "💛", "🎊", "❤️", "✨", "🎉"];

function titleCaseName(name: string): string {
  return name.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  const next = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

function openLogin() {
  document.dispatchEvent(new CustomEvent("open-login"));
}

function Avatar({
  name,
  url,
  size = 44,
}: {
  name: string;
  url: string | null;
  size?: number;
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="rounded-full shrink-0 flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, background: "var(--color-primary)", fontSize: size * 0.38 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function AskMessage({
  ask,
  viewerId,
  canTrack,
  bursting,
  onBurst,
  members,
}: {
  ask: SpecificAskCard;
  viewerId: string | null;
  canTrack: boolean;
  bursting: boolean;
  onBurst: () => void;
  members: DirectoryMember[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notes, setNotes] = useState(ask.seekerNotes ?? "");
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(ask.askText);
  const [draftNotes, setDraftNotes] = useState(ask.notes ?? "");
  const [keptConnectors, setKeptConnectors] = useState(ask.connectors);
  const [addedMembers, setAddedMembers] = useState<DirectoryMember[]>([]);
  const [connectorQuery, setConnectorQuery] = useState("");
  const isSeeker = viewerId === ask.seeker.id;
  const alreadyConnector = Boolean(viewerId) && ask.connectors.some((c) => c.memberId === viewerId);
  const canUpdateStatus = isSeeker || canTrack;
  const notConnected = ask.status !== "connected";
  const takenConnectorIds = new Set([
    ask.seeker.id,
    ...keptConnectors.map((c) => c.memberId).filter((id): id is string => Boolean(id)),
    ...addedMembers.map((m) => m.id),
  ]);
  const connectorMatches = members
    .filter((m) => !takenConnectorIds.has(m.id))
    .filter((m) => m.name.toLowerCase().includes(connectorQuery.trim().toLowerCase()))
    .slice(0, 8);

  const run = (work: () => Promise<{ error?: string }>) => {
    setError("");
    startTransition(async () => {
      const result = await work();
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <article
      id={`ask-${ask.id}`}
      className="flex gap-3 px-4 py-4 sm:px-5 bg-white rounded-2xl"
      style={{ border: "1px solid #E5E7EB" }}
    >
      {ask.seeker.slug ? (
        <Link href={`/members/${ask.seeker.slug}`} className="shrink-0 mt-0.5">
          <Avatar name={ask.seeker.name} url={ask.seeker.profilePictureUrl} />
        </Link>
      ) : (
        <span className="shrink-0 mt-0.5">
          <Avatar name={ask.seeker.name} url={ask.seeker.profilePictureUrl} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          {ask.seeker.slug ? (
            <Link href={`/members/${ask.seeker.slug}`} className="font-semibold text-xs hover:underline" style={{ color: "var(--color-dark)" }}>
              {titleCaseName(ask.seeker.name)}
            </Link>
          ) : (
            <span className="font-semibold text-xs" style={{ color: "var(--color-dark)" }}>{titleCaseName(ask.seeker.name)}</span>
          )}
          {ask.seeker.category && <span className="text-xs text-gray-400">{ask.seeker.category}</span>}
          {canTrack && !editing && (
            <button
              type="button"
              onClick={() => {
                setDraftText(ask.askText);
                setDraftNotes(ask.notes ?? "");
                setKeptConnectors(ask.connectors);
                setAddedMembers([]);
                setConnectorQuery("");
                setError("");
                setEditing(true);
              }}
              className="cursor-pointer text-[11px] font-semibold rounded-full px-2 py-0.5"
              style={{ border: "1px solid #D1D5DB", color: "var(--color-dark)" }}
            >
              Edit
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {askedAgoLabel(ask.firstAskedOn)}
          <span className="text-gray-300"> · </span>
          First asked {formatMeetingLong(ask.firstAskedOn)}
        </p>

        {editing ? (
          <form
            className="mt-2 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const result = await updateSpecificAskDetailsAction({
                  askId: ask.id,
                  askText: draftText,
                  notes: draftNotes,
                  keepConnectorIds: keptConnectors.map((c) => c.id),
                  addMemberIds: addedMembers.map((m) => m.id),
                });
                if (!result.error) setEditing(false);
                return result;
              });
            }}
          >
            <label className="block text-xs font-semibold text-gray-500">
              Ask
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal text-gray-800"
                required
              />
            </label>
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500">
                Connection promised by
                <input
                  value={connectorQuery}
                  onChange={(e) => setConnectorQuery(e.target.value)}
                  placeholder="Search members to add"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal text-gray-800"
                />
              </label>
              {connectorQuery.trim() && (
                <ul className="absolute z-20 mt-1 w-full max-h-40 overflow-auto rounded-xl bg-white shadow-lg" style={{ border: "1px solid #E5E7EB" }}>
                  {connectorMatches.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        className="cursor-pointer w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => {
                          setAddedMembers((list) => (list.some((person) => person.id === m.id) ? list : [...list, m]));
                          setConnectorQuery("");
                        }}
                      >
                        {titleCaseName(m.name)}
                      </button>
                    </li>
                  ))}
                  {connectorMatches.length === 0 && <li className="px-3 py-2 text-sm text-gray-400">No member matches.</li>}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {keptConnectors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setKeptConnectors((list) => list.filter((item) => item.id !== c.id))}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                  >
                    {titleCaseName(c.name)} ×
                  </button>
                ))}
                {addedMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAddedMembers((list) => list.filter((item) => item.id !== m.id))}
                    className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                  >
                    {titleCaseName(m.name)} ×
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-xs font-semibold text-gray-500">
              Notes
              <input
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-normal text-gray-800"
                placeholder="Optional note for the tracker"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="cursor-pointer text-xs font-semibold rounded-lg px-3 py-1.5 text-white disabled:opacity-40"
                style={{ background: "var(--color-primary)" }}
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="cursor-pointer text-xs font-semibold rounded-lg px-3 py-1.5"
                style={{ border: "1px solid #D1D5DB", color: "#374151" }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
        <div
          className="mt-2 inline-block max-w-full rounded-2xl rounded-tl-md px-4 py-2.5 text-[15px] font-semibold leading-snug"
          style={{ background: "#FFF6D8", color: "#1A1A2E", boxShadow: "inset 0 0 0 1.5px #F5A623" }}
        >
          {ask.askText}
        </div>

        {ask.status === "connected" && ask.connectedAt && (
          <p className="text-xs font-semibold mt-2" style={{ color: "#15803D" }}>
            ✅ {connectedInLabel(ask.firstAskedOn, ask.connectedAt)}
          </p>
        )}

        <p className="mt-2 text-xs font-semibold text-gray-500">Connection Promised By:</p>
        {ask.connectors.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ask.connectors.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 pr-2.5 pl-1 py-0.5 text-xs text-gray-700">
                <Avatar name={c.name} url={c.profilePictureUrl} size={18} />
                {c.slug ? (
                  <Link href={`/members/${c.slug}`} className="hover:underline">{titleCaseName(c.name)}</Link>
                ) : (
                  titleCaseName(c.name)
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-gray-400">No one yet</p>
        )}

        {ask.notes && (
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold">Notes: </span>{ask.notes}
          </p>
        )}
        {ask.seekerNotes && !isSeeker && (
          <p className="mt-1 text-sm text-gray-600">
            <span className="font-semibold">Seeker note: </span>{ask.seekerNotes}
          </p>
        )}

        {isSeeker && (
          <form
            className="mt-2 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => updateSpecificAskSeekerNotesAction(ask.id, notes));
            }}
          >
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              placeholder="Add a note…"
            />
            <button
              type="submit"
              disabled={pending || notes.trim() === (ask.seekerNotes ?? "").trim()}
              className="self-start cursor-pointer text-xs font-semibold rounded-lg px-3 py-1.5 text-white disabled:opacity-40 disabled:cursor-pointer"
              style={{ background: "var(--color-primary)" }}
            >
              Save note
            </button>
          </form>
        )}
          </>
        )}

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      <div className="flex flex-col gap-1.5 shrink-0 items-stretch pt-5">
        {STATUS_BUTTONS.map((status) => {
          const selected = status.value === "connected" ? ask.status === "connected" : notConnected;
          return (
            <button
              key={status.value}
              type="button"
              onClick={() => {
                if (!viewerId) {
                  openLogin();
                  return;
                }
                if (!canUpdateStatus || selected) return;
                run(() => updateSpecificAskStatusAction(ask.id, status.value));
              }}
              className="cursor-pointer text-left text-[11px] font-semibold rounded-full px-2.5 py-1.5 whitespace-nowrap"
              style={{
                background: selected ? "var(--color-dark)" : "white",
                color: selected ? "white" : "#374151",
                border: selected ? "1px solid var(--color-dark)" : "1px solid #D1D5DB",
              }}
              aria-pressed={selected}
            >
              {status.emoji} {status.label}
            </button>
          );
        })}

        {ask.status !== "connected" && (
          <button
            type="button"
            onClick={() => {
              if (!viewerId) {
                openLogin();
                return;
              }
              if (isSeeker || pending) return;
              if (!alreadyConnector) onBurst();
              run(() => volunteerSpecificAskAction(ask.id));
            }}
            aria-pressed={alreadyConnector}
            title={alreadyConnector ? "Click again to undo" : "I can connect"}
            className="cursor-pointer relative text-left text-[11px] font-semibold rounded-full px-2.5 py-1.5 whitespace-nowrap"
            style={{
              background: alreadyConnector ? "#166534" : "#DCFCE7",
              color: alreadyConnector ? "white" : "#166534",
              border: "1px solid #86EFAC",
            }}
          >
            {alreadyConnector ? "🙋 Undo connect" : "🙋 I can connect"}
            {bursting && (
              <span className="pointer-events-none absolute inset-0" aria-hidden>
                {BURST.map((emoji, i) => (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 text-base animate-ask-pop"
                    style={{
                      animationDelay: `${i * 45}ms`,
                      ["--pop-x" as string]: `${(i - 3) * 16}px`,
                      ["--pop-y" as string]: `${-36 - (i % 3) * 12}px`,
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </span>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

export default function SpecificAsksBoard({
  meetings,
  asksByDate,
  members,
  canTrack,
  highlightAskId,
  setupError,
}: {
  meetings: SpecificAskMeeting[];
  asksByDate: Record<string, SpecificAskCard[]>;
  members: DirectoryMember[];
  canTrack: boolean;
  highlightAskId?: string | null;
  setupError: string | null;
}) {
  const router = useRouter();
  const { member } = useMemberSession();
  const stripRef = useRef<HTMLDivElement>(null);
  const chronological = useMemo(() => [...meetings].reverse(), [meetings]);
  const latest = meetings[0]?.meetingDate ?? "";
  const highlightDate = useMemo(() => {
    if (!highlightAskId) return "";
    return meetings.find((m) => (asksByDate[m.meetingDate] ?? []).some((a) => a.id === highlightAskId))?.meetingDate ?? "";
  }, [highlightAskId, meetings, asksByDate]);

  const [selectedDate, setSelectedDate] = useState(highlightDate || latest);
  const [filter, setFilter] = useState<Filter>("all");
  const [focusMemberId, setFocusMemberId] = useState<string | null>(null);
  const [burstAskId, setBurstAskId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState(kolkataToday);
  const [memberQuery, setMemberQuery] = useState("");
  const [seekerId, setSeekerId] = useState("");
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [askText, setAskText] = useState("");
  const [existingAskId, setExistingAskId] = useState("");
  const [openAsks, setOpenAsks] = useState<OpenAskOption[]>([]);
  const [connectorQuery, setConnectorQuery] = useState("");
  const [connectorIds, setConnectorIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);
  const fairnessSeed = useMemo(() => {
    const day = kolkataToday();
    let hash = 2166136261;
    for (let i = 0; i < day.length; i++) {
      hash ^= day.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) || 1;
  }, []);

  const dateIndex = chronological.findIndex((m) => m.meetingDate === selectedDate);

  const selectDate = (date: string) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const active = strip.querySelector<HTMLElement>("[data-active='true']");
    if (!active) return;
    const left = active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2;
    strip.scrollTo({ left, behavior: "smooth" });
  }, [selectedDate]);

  useEffect(() => {
    if (!highlightAskId) return;
    document.getElementById(`ask-${highlightAskId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightAskId, selectedDate, filter, focusMemberId]);

  useEffect(() => {
    if (!burstAskId) return;
    const timer = setTimeout(() => setBurstAskId(null), 1000);
    return () => clearTimeout(timer);
  }, [burstAskId]);

  useEffect(() => {
    if (!seekerId || !canTrack) {
      setOpenAsks([]);
      return;
    }
    let cancelled = false;
    listOpenAsksAction(seekerId).then((res) => {
      if (cancelled) return;
      setOpenAsks(res.asks);
      if (res.asks.length === 0) {
        setMode("new");
        setExistingAskId("");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [seekerId, canTrack]);

  const today = kolkataToday();
  const seekerStats = useMemo(() => {
    const byId = new Map<string, SpecificAskCard>();
    for (const list of Object.values(asksByDate)) {
      for (const ask of list) byId.set(ask.id, ask);
    }
    const grouped = new Map<string, { ask: SpecificAskCard; items: SpecificAskCard[] }>();
    for (const ask of byId.values()) {
      const current = grouped.get(ask.seeker.id);
      if (current) current.items.push(ask);
      else grouped.set(ask.seeker.id, { ask, items: [ask] });
    }
    const ranked = [...grouped.values()].map(({ ask, items }) => {
      const open = items.filter((item) => item.status !== "connected");
      const longestPending = open.reduce(
        (max, item) => Math.max(max, daysBetween(item.firstAskedOn, today)),
        0
      );
      return {
        id: ask.seeker.id,
        name: ask.seeker.name,
        slug: ask.seeker.slug,
        profilePictureUrl: ask.seeker.profilePictureUrl,
        count: items.length,
        openCount: open.length,
        longestPending,
      };
    });
    return seededShuffle(ranked, fairnessSeed + 7919);
  }, [asksByDate, today, fairnessSeed]);

  const asks = asksByDate[selectedDate] ?? [];
  const visible = asks.filter((ask) => {
    if (focusMemberId && ask.seeker.id !== focusMemberId) return false;
    if (filter === "connected") return ask.status === "connected";
    if (filter === "not_connected") return ask.status !== "connected";
    return true;
  });
  const visibleKey = visible.map((ask) => ask.id).join("|");
  const shuffledIds = useMemo(
    () => seededShuffle(visibleKey ? visibleKey.split("|") : [], fairnessSeed),
    [visibleKey, fairnessSeed]
  );
  const askById = new Map(visible.map((ask) => [ask.id, ask]));
  const shuffledVisible = shuffledIds.flatMap((id) => {
    const ask = askById.get(id);
    return ask ? [ask] : [];
  });

  const memberMatches = members
    .filter((m) => m.name.toLowerCase().includes(memberQuery.trim().toLowerCase()))
    .slice(0, 8);
  const seeker = members.find((m) => m.id === seekerId) ?? null;
  const connectorMatches = members
    .filter((m) => m.id !== seekerId)
    .filter((m) => m.name.toLowerCase().includes(connectorQuery.trim().toLowerCase()))
    .slice(0, 8);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    startTransition(async () => {
      const result = await logSpecificAskAction({
        meetingDate: formDate,
        seekerMemberId: seekerId,
        mode,
        askText,
        existingAskId,
        connectorMemberIds: connectorIds,
        notes,
      });
      if (result.error) {
        setFormError(result.error);
        return;
      }
      setSelectedDate(formDate);
      setAskText("");
      setNotes("");
      setConnectorIds([]);
      setConnectorQuery("");
      setSeekerId("");
      setMemberQuery("");
      setOpenAsks([]);
      setMode("new");
      setExistingAskId("");
      router.refresh();
    });
  };

  const download = async () => {
    setExporting(true);
    setFormError("");
    const result = await exportSpecificAsksAction();
    setExporting(false);
    if (result.error || !result.base64 || !result.filename) {
      setFormError(result.error ?? "Export failed.");
      return;
    }
    const bytes = Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (setupError) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl bg-white p-6 text-sm text-gray-700" style={{ border: "1px solid #FECACA" }}>
        {setupError}
      </div>
    );
  }

  const logForm = canTrack ? (
    <form onSubmit={submit} className="rounded-2xl bg-white p-4 lg:sticky lg:top-24" style={{ border: "1px solid #E5E7EB" }}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="font-bold text-sm" style={{ color: "var(--color-dark)" }}>Log a specific ask</h2>
        <button
          type="button"
          onClick={download}
          disabled={exporting}
          className="cursor-pointer text-[11px] font-semibold rounded-lg px-2.5 py-1.5"
          style={{ border: "1px solid #D1D5DB", color: "var(--color-dark)" }}
        >
          {exporting ? "Preparing…" : "Excel"}
        </button>
      </div>

      <label className="block text-xs font-semibold text-gray-500">
        Meeting date
        <input
          type="date"
          value={formDate}
          onChange={(e) => setFormDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-800"
          required
        />
      </label>

      <div className="mt-3 relative">
        <label className="block text-xs font-semibold text-gray-500">
          Member
          <input
            value={seeker ? seeker.name : memberQuery}
            onChange={(e) => {
              setSeekerId("");
              setMemberQuery(e.target.value);
              setMode("new");
              setExistingAskId("");
            }}
            placeholder="Search a member"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-800"
          />
        </label>
        {!seekerId && memberQuery.trim() && (
          <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-xl bg-white shadow-lg" style={{ border: "1px solid #E5E7EB" }}>
            {memberMatches.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="cursor-pointer w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setSeekerId(m.id);
                    setMemberQuery("");
                    setMode("new");
                  }}
                >
                  <Avatar name={m.name} url={m.profilePictureUrl} size={28} />
                  <span>
                    <span className="block font-medium">{m.name}</span>
                    {m.category && <span className="block text-xs text-gray-400">{m.category}</span>}
                  </span>
                </button>
              </li>
            ))}
            {memberMatches.length === 0 && <li className="px-3 py-2 text-sm text-gray-400">No member matches.</li>}
          </ul>
        )}
      </div>

      {seeker && (
        <fieldset className="mt-3 space-y-2">
          <legend className="text-xs font-semibold text-gray-500">Ask</legend>
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="radio" name="ask-mode" checked={mode === "new"} onChange={() => setMode("new")} className="mt-1" />
            <span>Type a new ask</span>
          </label>
          {mode === "new" && (
            <textarea
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              rows={2}
              placeholder="Who or what are they asking to be connected to?"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          )}
          {openAsks.map((ask) => (
            <label key={ask.id} className="flex items-start gap-2 text-sm rounded-lg px-2 py-1.5 cursor-pointer" style={{ background: mode === "existing" && existingAskId === ask.id ? "#FEF2F2" : "transparent" }}>
              <input
                type="radio"
                name="ask-mode"
                checked={mode === "existing" && existingAskId === ask.id}
                onChange={() => {
                  setMode("existing");
                  setExistingAskId(ask.id);
                }}
                className="mt-1"
              />
              <span>
                <span className="block">{ask.askText}</span>
                <span className="block text-xs text-gray-500">
                  {openForLabel(ask.firstAskedOn)} · since {formatMeetingLong(ask.firstAskedOn)}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="mt-3 relative">
        <label className="block text-xs font-semibold text-gray-500">
          Who can connect
          <input
            value={connectorQuery}
            onChange={(e) => setConnectorQuery(e.target.value)}
            placeholder="Search members"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-800"
          />
        </label>
        {connectorQuery.trim() && (
          <ul className="absolute z-20 mt-1 w-full max-h-40 overflow-auto rounded-xl bg-white shadow-lg" style={{ border: "1px solid #E5E7EB" }}>
            {connectorMatches.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className="cursor-pointer w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={() => {
                    setConnectorIds((ids) => (ids.includes(m.id) ? ids : [...ids, m.id]));
                    setConnectorQuery("");
                  }}
                >
                  {m.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {connectorIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {connectorIds.map((id) => {
              const person = members.find((m) => m.id === id);
              if (!person) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setConnectorIds((ids) => ids.filter((x) => x !== id))}
                  className="cursor-pointer text-xs rounded-full px-2.5 py-1 bg-gray-100"
                >
                  {person.name} ×
                </button>
              );
            })}
          </div>
        )}
      </div>

      <label className="block text-xs font-semibold text-gray-500 mt-3">
        Notes
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-800"
          placeholder="Optional note for the tracker"
        />
      </label>

      {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer mt-3 w-full text-sm font-semibold text-white rounded-lg px-4 py-2 disabled:opacity-60"
        style={{ background: "var(--color-primary)" }}
      >
        {pending ? "Saving…" : "Save ask"}
      </button>
    </form>
  ) : null;

  return (
    <div className="mx-auto" style={{ maxWidth: canTrack ? 1180 : 980 }}>
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          aria-label="Back"
          title="Back"
          disabled={dateIndex <= 0}
          onClick={() => {
            const previous = chronological[dateIndex - 1];
            if (previous) selectDate(previous.meetingDate);
          }}
          className="cursor-pointer shrink-0 w-9 h-9 rounded-full bg-white text-lg font-bold disabled:opacity-30"
          style={{ border: "1px solid #E5E7EB", color: "var(--color-dark)" }}
        >
          ‹
        </button>
        <div ref={stripRef} className="flex gap-2 overflow-x-auto flex-1 py-1">
          {chronological.length === 0 && <p className="text-sm text-gray-500">No meeting dates yet.</p>}
          {chronological.map((meeting) => {
            const parts = meetingParts(meeting.meetingDate);
            const active = meeting.meetingDate === selectedDate;
            const isLatest = meeting.meetingDate === latest;
            return (
              <button
                key={meeting.id}
                type="button"
                data-active={active ? "true" : "false"}
                onClick={() => selectDate(meeting.meetingDate)}
                className="cursor-pointer shrink-0 rounded-2xl px-4 py-2 text-center min-w-[76px]"
                style={{
                  background: active ? "var(--color-primary)" : "white",
                  color: active ? "white" : "var(--color-dark)",
                  border: active ? "1px solid var(--color-primary)" : "1px solid #E5E7EB",
                }}
              >
                <span className="block text-lg font-bold leading-none">{parts.day}</span>
                <span className="block text-[11px] font-semibold tracking-wide mt-1">{parts.mon}</span>
                {isLatest && <span className="block text-[9px] uppercase tracking-wider mt-1 opacity-80">Latest</span>}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Front"
          title="Front"
          disabled={dateIndex < 0 || dateIndex >= chronological.length - 1}
          onClick={() => {
            const next = chronological[dateIndex + 1];
            if (next) selectDate(next.meetingDate);
          }}
          className="cursor-pointer shrink-0 w-9 h-9 rounded-full bg-white text-lg font-bold disabled:opacity-30"
          style={{ border: "1px solid #E5E7EB", color: "var(--color-dark)" }}
        >
          ›
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((item) => {
          const active = filter === item.id;
          const count = asks.filter((ask) => {
            if (item.id === "connected") return ask.status === "connected";
            if (item.id === "not_connected") return ask.status !== "connected";
            return true;
          }).length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold"
              style={{
                background: active ? "var(--color-dark)" : "white",
                color: active ? "white" : "#374151",
                border: active ? "1px solid var(--color-dark)" : "1px solid #E5E7EB",
              }}
            >
              {item.label}
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        className={
          canTrack
            ? "grid grid-cols-1 gap-5 lg:grid-cols-[230px_minmax(0,1fr)_300px] lg:items-start"
            : "grid grid-cols-1 gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:items-start"
        }
      >
        <aside className="order-2 lg:order-1 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
            <button
              type="button"
              onClick={() => setFocusMemberId(null)}
              className="cursor-pointer w-full text-left px-3 py-2 text-sm font-semibold border-b border-gray-100"
              style={{
                background: focusMemberId === null ? "#F3F4F6" : "white",
                color: "var(--color-dark)",
              }}
            >
              Members
            </button>
            <div className="max-h-80 overflow-y-auto">
            {seekerStats.map((person) => {
              const active = focusMemberId === person.id;
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setFocusMemberId(active ? null : person.id)}
                  className="cursor-pointer w-full text-left px-3 py-1.5 flex items-center gap-2 border-t border-gray-100"
                  style={{ background: active ? "#FFF7ED" : "white" }}
                >
                  <Avatar name={person.name} url={person.profilePictureUrl} size={28} />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold truncate leading-tight" style={{ color: "var(--color-dark)" }}>
                      {titleCaseName(person.name)}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {person.openCount > 0 ? (
                        <span
                          className="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                          style={{ background: "#FEF3C7", color: "#92400E" }}
                        >
                          {person.longestPending}d pending
                        </span>
                      ) : (
                        <span
                          className="inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                          style={{ background: "#DCFCE7", color: "#166534" }}
                        >
                          connected
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
            </div>
          </div>
        </aside>

        <div className="order-1 lg:order-2 min-w-0 flex flex-col gap-3">
          {visible.length === 0 ? (
            <p className="text-sm text-gray-500 px-4 py-10 text-center bg-white rounded-2xl" style={{ border: "1px solid #E5E7EB" }}>
              {selectedDate ? "No asks in this view." : "Pick a meeting date to see asks."}
            </p>
          ) : (
            shuffledVisible.map((ask) => (
              <AskMessage
                key={ask.id}
                ask={ask}
                viewerId={member?.id ?? null}
                canTrack={canTrack}
                bursting={burstAskId === ask.id}
                onBurst={() => setBurstAskId(ask.id)}
                members={members}
              />
            ))
          )}
        </div>

        {logForm && <aside className="order-3">{logForm}</aside>}
      </div>
    </div>
  );
}
