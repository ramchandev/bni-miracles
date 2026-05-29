"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { initiatives } from "@/lib/initiatives";
import type { PowerTeamNavItem } from "@/lib/power-teams-server";

const navLinksBeforeDropdowns = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/members", label: "Members" },
];

const navLinksAfterDropdowns = [{ href: "/contact", label: "Contact" }];

const linkClass =
  "text-white font-medium text-sm transition-colors hover:text-yellow-400";

const megaPanelStyle = {
  background: "rgba(26,26,46,0.98)",
  border: "1px solid rgba(255,255,255,0.12)",
} as const;

type Props = {
  powerTeams?: PowerTeamNavItem[];
};

function NavMegaDropdown<T extends { key: string }>({
  label,
  href,
  overviewLabel,
  overviewHref,
  items,
  renderItem,
  panelMinWidth = 520,
}: {
  label: string;
  href: string;
  overviewLabel: string;
  overviewHref: string;
  items: T[];
  renderItem: (item: T) => ReactNode;
  panelMinWidth?: number;
}) {
  return (
    <div className="relative group">
      <Link
        href={href}
        className={`${linkClass} inline-flex items-center gap-1`}
        style={{ letterSpacing: "0.01em" }}
      >
        {label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className="opacity-70 transition-transform group-hover:rotate-180"
          aria-hidden
        >
          <path d="M2 3.5L5 7l3-3.5H2z" />
        </svg>
      </Link>
      <div
        className="absolute left-0 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50"
        style={{ minWidth: panelMinWidth }}
      >
        <div className="rounded-xl shadow-xl overflow-hidden" style={megaPanelStyle}>
          <Link
            href={overviewHref}
            className="block px-4 py-2.5 text-sm font-semibold text-yellow-400 hover:bg-white/5 border-b border-white/10"
          >
            {overviewLabel}
          </Link>
          <div className="grid grid-cols-2 gap-x-0 py-1">
            {items.map((item) => (
              <div key={item.key}>{renderItem(item)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Header({ powerTeams = [] }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [initiativesOpen, setInitiativesOpen] = useState(false);
  const [powerTeamsOpen, setPowerTeamsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initiativeItems = initiatives.map((i) => ({ ...i, key: i.slug }));
  const powerTeamItems = powerTeams.map((t) => ({ ...t, key: t.slug }));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(26,26,46,0.97)" : "rgba(26,26,46,0.85)",
        backdropFilter: "blur(10px)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.25)" : "none",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <div className="flex items-center justify-between" style={{ height: 70 }}>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/BNI-Miracles-Logo.png" alt="BNI Miracles Logo" width={120} height={50} style={{ objectFit: "contain" }} priority />
          </Link>

          <nav className="hidden md:flex items-center gap-5 lg:gap-6">
            {navLinksBeforeDropdowns.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass} style={{ letterSpacing: "0.01em" }}>
                {link.label}
              </Link>
            ))}

            <NavMegaDropdown
              label="Power Team"
              href="/power-team"
              overviewHref="/power-team"
              overviewLabel="All Power Teams"
              items={powerTeamItems}
              panelMinWidth={powerTeamItems.length > 4 ? 480 : 360}
              renderItem={(team) => (
                <Link
                  href={`/power-team/${team.slug}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-yellow-400 transition-colors"
                >
                  <span className="shrink-0 text-base leading-none" aria-hidden>
                    {team.emoji}
                  </span>
                  <span className="font-medium leading-snug">{team.name}</span>
                </Link>
              )}
            />

            <NavMegaDropdown
              label="Initiatives"
              href="/initiatives"
              overviewHref="/initiatives"
              overviewLabel="All Initiatives"
              items={initiativeItems}
              panelMinWidth={560}
              renderItem={(init) => (
                <Link
                  href={`/initiatives/${init.slug}`}
                  className="flex items-start gap-2.5 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5 hover:text-yellow-400 transition-colors"
                >
                  <span className="shrink-0 text-base leading-none mt-0.5" aria-hidden>
                    {init.icon}
                  </span>
                  <span>
                    <span className="block font-medium leading-snug">{init.englishName}</span>
                    <span
                      className="block text-xs text-white/50 mt-0.5 leading-snug"
                      style={{ fontFamily: "Noto Sans Tamil, sans-serif" }}
                    >
                      {init.tamilName}
                    </span>
                  </span>
                </Link>
              )}
            />

            {navLinksAfterDropdowns.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass} style={{ letterSpacing: "0.01em" }}>
                {link.label}
              </Link>
            ))}
            <Link href="/attend-meeting" className="btn-primary text-sm" style={{ padding: "0.5rem 1.25rem" }}>
              Attend a Meeting
            </Link>
            <a
              href="https://wa.me/919841767641"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex items-center justify-center w-9 h-9 rounded-full"
              style={{ background: "#25D366" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </nav>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            {navLinksBeforeDropdowns.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white font-medium py-2 px-1 border-b border-white/10"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-b border-white/10">
              <button
                type="button"
                className="w-full flex items-center justify-between text-white font-medium py-2 px-1"
                onClick={() => setPowerTeamsOpen(!powerTeamsOpen)}
                aria-expanded={powerTeamsOpen}
              >
                Power Team
                <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${powerTeamsOpen ? "rotate-180" : ""}`} aria-hidden>
                  <path d="M2 3.5L5 7l3-3.5H2z" />
                </svg>
              </button>
              {powerTeamsOpen && (
                <div className="pb-2 pl-3 flex flex-col gap-0.5">
                  <Link href="/power-team" className="text-yellow-400 text-sm font-semibold py-2" onClick={() => setMenuOpen(false)}>
                    All Power Teams
                  </Link>
                  {powerTeams.map((team) => (
                    <Link
                      key={team.slug}
                      href={`/power-team/${team.slug}`}
                      className="text-white/80 text-sm py-2 flex items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span aria-hidden>{team.emoji}</span>
                      {team.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b border-white/10">
              <button
                type="button"
                className="w-full flex items-center justify-between text-white font-medium py-2 px-1"
                onClick={() => setInitiativesOpen(!initiativesOpen)}
                aria-expanded={initiativesOpen}
              >
                Initiatives
                <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor" className={`transition-transform ${initiativesOpen ? "rotate-180" : ""}`} aria-hidden>
                  <path d="M2 3.5L5 7l3-3.5H2z" />
                </svg>
              </button>
              {initiativesOpen && (
                <div className="pb-2 pl-3 flex flex-col gap-0.5">
                  <Link href="/initiatives" className="text-yellow-400 text-sm font-semibold py-2" onClick={() => setMenuOpen(false)}>
                    All Initiatives
                  </Link>
                  {initiatives.map((init) => (
                    <Link
                      key={init.slug}
                      href={`/initiatives/${init.slug}`}
                      className="text-white/80 text-sm py-2 flex items-center gap-2"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span aria-hidden>{init.icon}</span>
                      {init.englishName}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinksAfterDropdowns.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white font-medium py-2 px-1 border-b border-white/10"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <Link href="/attend-meeting" className="btn-primary mt-2 text-center" onClick={() => setMenuOpen(false)}>
              Attend a Meeting
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
