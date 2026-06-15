"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const DISMISS_KEY = "miracle-members-install-banner-dismissed";
const BANNER_OFFSET = "5rem";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  return touch && narrow;
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function registerServiceWorker() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    process.env.NODE_ENV !== "production"
  ) {
    return;
  }

  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

function InstallInstructionsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const steps = [
    {
      n: 1,
      text: "Tap the Share button in your browser toolbar (square with an arrow pointing up).",
    },
    {
      n: 2,
      text: 'Scroll down and tap "Add to Home Screen".',
    },
    {
      n: 3,
      text: 'Tap "Add" in the top corner. Miracle Members will appear on your home screen.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-instructions-title"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl mb-2 sm:mb-0"
        style={{ background: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors hover:bg-gray-100"
          style={{ color: "var(--color-gray)" }}
          aria-label="Close"
        >
          ✕
        </button>

        <h2
          id="install-instructions-title"
          className="text-lg font-bold mb-1 pr-8"
          style={{ color: "var(--color-dark)" }}
        >
          Add to Home Screen
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--color-gray)" }}>
          Install Miracle Members for quick access — no browser needed.
        </p>

        <ol className="space-y-4">
          {steps.map((step) => (
            <li key={step.n} className="flex gap-3 text-sm" style={{ color: "var(--color-text)" }}>
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--color-primary)" }}
              >
                {step.n}
              </span>
              <span className="leading-relaxed pt-0.5">{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const setBannerOffset = useCallback((show: boolean) => {
    document.documentElement.style.setProperty(
      "--install-banner-offset",
      show ? BANNER_OFFSET : "0px",
    );
  }, []);

  useEffect(() => {
    registerServiceWorker();

    if (isStandalone() || isDismissed() || !isMobileDevice()) {
      return;
    }

    setVisible(true);
    setBannerOffset(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      setBannerOffset(false);
    };
  }, [setBannerOffset]);

  useEffect(() => {
    setBannerOffset(visible);
    return () => setBannerOffset(false);
  }, [visible, setBannerOffset]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
    setShowInstructions(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      dismiss();
      return;
    }
    setShowInstructions(true);
  };

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-[60] px-4 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]"
        style={{
          background: "var(--color-dark)",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
        role="region"
        aria-label="Install app prompt"
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Image
            src="/web-app-manifest-192x192.png"
            alt=""
            width={44}
            height={44}
            className="shrink-0 rounded-xl"
            aria-hidden
          />
          <p className="flex-1 min-w-0 text-sm font-medium text-white leading-snug">
            Add Miracle Members to your home screen
          </p>
          <button
            type="button"
            onClick={handleInstall}
            className="shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-primary)" }}
          >
            {deferredPrompt ? "Install" : "How to install"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss install prompt"
          >
            ✕
          </button>
        </div>
      </div>

      {showInstructions && (
        <InstallInstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </>
  );
}
