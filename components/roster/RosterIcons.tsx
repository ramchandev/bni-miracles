import type { ReactNode } from "react";
import { Circle, Path, Rect, Svg } from "@react-pdf/renderer";

type IconProps = { size?: number; color?: string };

function Base({ size = 12, children }: { size?: number; children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {children}
    </Svg>
  );
}

export function PhoneIcon({ size = 10, color = "#64748B" }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.81a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2 .18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 14.92z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Base>
  );
}

/** Filled phone glyph for red circular action buttons. */
export function PhoneGlyph({ size = 10, color = "#FFFFFF" }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.81a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2 .18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 14.92z"
        fill={color}
      />
    </Base>
  );
}

export function MailGlyph({ size = 10, color = "#FFFFFF" }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 0l8 6 8-6"
        fill={color}
      />
    </Base>
  );
}

export function WhatsAppGlyph({ size = 10, color = "#FFFFFF" }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M12 2a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l5.4-1.4A9.5 9.5 0 1 0 12 2zm0 1.7a7.8 7.8 0 0 1 6.6 11.9l-.3.4.8 2.9-3-.8-.4.2A7.8 7.8 0 1 1 12 3.7zm4.3 9.9c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.7.8-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.8-1.1-.7-.6-1.1-1.3-1.3-1.5-.1-.2 0-.4.1-.5l.4-.4c.1-.1.1-.3.2-.4 0-.1 0-.3-.1-.4-.1-.1-.5-1.3-.7-1.7-.2-.5-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 2.3.9 2.3.6 2.7.6.4 0 1.3-.5 1.5-1 .2-.5.2-.9.1-1z"
        fill={color}
      />
    </Base>
  );
}

export function MailIcon({ size = 10, color = "#64748B" }: IconProps) {
  return (
    <Base size={size}>
      <Rect x={2} y={4} width={20} height={16} rx={2} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M22 7l-10 7L2 7" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Base>
  );
}

export function GlobeIcon({ size = 10, color = "#64748B" }: IconProps) {
  return (
    <Base size={size}>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" stroke={color} strokeWidth={1.8} fill="none" />
    </Base>
  );
}

export function MapPinIcon({ size = 10, color = "#64748B" }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={10} r={2.5} stroke={color} strokeWidth={1.8} fill="none" />
    </Base>
  );
}

export function BriefcaseIcon({ size = 14, color = "#C8102E" }: IconProps) {
  return (
    <Base size={size}>
      <Rect x={2} y={7} width={20} height={14} rx={2} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 12h20" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </Base>
  );
}

export function BuildingIcon({ size = 14, color = "#C8102E" }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2M17 13h1M17 17h1" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </Base>
  );
}

export function ChartIcon({ size = 14, color = "#C8102E" }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Base>
  );
}

export function HeartIcon({ size = 14, color = "#C8102E" }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Base>
  );
}

export function CurrencyIcon({ size = 14, color = "#C8102E" }: IconProps) {
  return (
    <Base size={size}>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M8 9h6.5a2.5 2.5 0 0 1 0 5H9M9 14h6.5a2.5 2.5 0 0 1 0 5H8M12 7v2M12 17v2" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </Base>
  );
}

export function PaletteIcon({ size = 14, color = "#C8102E" }: IconProps) {
  return (
    <Base size={size}>
      <Path
        d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H13a1.5 1.5 0 0 1 0-3h3A6 6 0 0 0 12 3z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={8} cy={10} r={1} fill={color} />
      <Circle cx={11} cy={7.5} r={1} fill={color} />
      <Circle cx={15} cy={8.5} r={1} fill={color} />
    </Base>
  );
}

export function BookIcon({ size = 14, color = "#C8102E" }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 0-2 2V5z" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 3v18" stroke={color} strokeWidth={1.8} fill="none" />
    </Base>
  );
}

export function UsersIcon({ size = 14, color = "#C8102E" }: IconProps) {
  return (
    <Base size={size}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Circle cx={9} cy={7} r={3.2} stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.3M16.5 3.8a3.2 3.2 0 0 1 0 6.2" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </Base>
  );
}

/** Pick a flat group icon from the category-group name. */
export function GroupIcon({ name, size = 14, color = "#C8102E" }: IconProps & { name: string }) {
  const key = name.toLowerCase();
  if (/build|construct|transform|infra|real\s*estate|property/.test(key)) {
    return <BuildingIcon size={size} color={color} />;
  }
  if (/business|growth|sales|market|consult/.test(key)) {
    return <ChartIcon size={size} color={color} />;
  }
  if (/life|well|health|food|hospital|care/.test(key)) {
    return <HeartIcon size={size} color={color} />;
  }
  if (/money|law|finance|bank|tax|insur/.test(key)) {
    return <CurrencyIcon size={size} color={color} />;
  }
  if (/brand|create|design|media|print|market/.test(key)) {
    return <PaletteIcon size={size} color={color} />;
  }
  if (/educat|train|school|learn/.test(key)) {
    return <BookIcon size={size} color={color} />;
  }
  if (/other|general|member/.test(key)) {
    return <UsersIcon size={size} color={color} />;
  }
  return <BriefcaseIcon size={size} color={color} />;
}
