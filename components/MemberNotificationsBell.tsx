"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  fetchMemberNotificationsAction,
  markNotificationsReadAction,
} from "@/app/actions/notifications";
import { notificationIcon } from "@/lib/notifications";
import type { MemberNotification } from "@/lib/notifications";

const READ_STORAGE_KEY = "bni_notif_read";

function loadLocalReadKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveLocalReadKeys(keys: Set<string>) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...keys]));
}

function notifReadKey(n: MemberNotification): string {
  return `${n.type}:${n.source_id ?? n.id}`;
}

function applyLocalReadState(
  notifications: MemberNotification[],
  localRead: Set<string>
): MemberNotification[] {
  return notifications.map((n) => {
    if (n.is_read) return n;
    const key = notifReadKey(n);
    return localRead.has(key) ? { ...n, is_read: true } : n;
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MemberNotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const localReadRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMemberNotificationsAction();
      const merged = applyLocalReadState(data.notifications, localReadRef.current);
      setNotifications(merged);
      setUnreadCount(merged.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("[MemberNotificationsBell] refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localReadRef.current = loadLocalReadKeys();
    setMounted(true);
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openPanel = async () => {
    const next = !open;
    setOpen(next);
    if (next) await refresh();
  };

  const markRead = async (ids: string[], keys: string[]) => {
    const idSet = new Set(ids);
    keys.forEach((k) => localReadRef.current.add(k));
    saveLocalReadKeys(localReadRef.current);
    await markNotificationsReadAction(ids.length ? ids : undefined);
    setNotifications((prev) =>
      prev.map((n) => (idSet.has(n.id) ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => {
      if (!ids.length) return 0;
      return Math.max(0, prev - ids.length);
    });
  };

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.is_read).map((n) => n.id);
    const keys = notifications.map(notifReadKey);
    await markRead(ids, keys);
  };

  const onItemClick = async (n: MemberNotification) => {
    if (!n.is_read) {
      const keys = [notifReadKey(n)];
      await markRead([n.id], keys);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={openPanel}
        aria-label={
          mounted && unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-white/10"
        style={{ border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {mounted && unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
            style={{ background: "var(--color-primary)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] overflow-hidden rounded-xl shadow-xl z-50 flex flex-col"
          style={{ background: "rgba(26,26,46,0.98)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {mounted && unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-yellow-400 hover:text-yellow-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-white/50 text-center">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-white/50 text-center">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.href ?? "/my-121"}
                  onClick={() => onItemClick(n)}
                  className="block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                  style={{ background: n.is_read ? "transparent" : "rgba(200,16,46,0.08)" }}
                >
                  <div className="flex gap-2">
                    <span className="shrink-0 text-base" aria-hidden>
                      {notificationIcon(n.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white leading-snug">{n.title}</p>
                      <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-white/40 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
