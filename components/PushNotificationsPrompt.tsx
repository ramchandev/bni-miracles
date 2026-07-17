"use client";

import { useEffect, useState } from "react";
import { savePushSubscriptionAction } from "@/app/actions/push";
import { useMemberSession } from "@/components/MemberSessionContext";

const DISMISS_KEY = "miracle-members-push-prompt-dismissed";

function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

async function subscribeAndSave(): Promise<{ error?: string }> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { error: "Push is not configured." };

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { error: "Could not create a subscription." };
  }

  return savePushSubscriptionAction(
    {
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    },
    navigator.userAgent
  );
}

export default function PushNotificationsPrompt() {
  const { member } = useMemberSession();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!member || !isPushSupported()) return;

    if (Notification.permission === "granted") {
      // Keep this device's subscription registered for the logged-in member
      // (covers new logins and re-installed service workers)
      subscribeAndSave().catch(() => {});
      return;
    }

    if (Notification.permission === "default" && !isDismissed()) {
      setVisible(true);
    }
  }, [member]);

  if (!visible || !member) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const enable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await subscribeAndSave();
      }
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
      setVisible(false);
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[70] px-4 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
      style={{
        background: "var(--color-dark)",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        marginBottom: "var(--install-banner-offset, 0px)",
      }}
      role="region"
      aria-label="Enable notifications prompt"
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <span className="shrink-0 text-2xl" aria-hidden>
          🔔
        </span>
        <p className="flex-1 min-w-0 text-sm font-medium text-white leading-snug">
          Get notified about your 1-2-1s and BizRox activity
        </p>
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--color-primary)", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Enabling…" : "Enable"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss notifications prompt"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
