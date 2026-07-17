"use client";

import React from "react";

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** "light" = white frosted glass, "dark" = smoked glass for dark UIs */
  tint?: "light" | "dark";
}

/**
 * Apple-style "liquid glass" surface: a distorted backdrop layer (via the
 * #glass-distortion SVG filter), a translucent white tint, and inner
 * specular highlights. Render <GlassFilter /> once on the page for the
 * distortion to work.
 */
export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  tint = "light",
}) => {
  const dark = tint === "dark";

  const glassStyle: React.CSSProperties = {
    boxShadow: dark
      ? "0 8px 24px rgba(0, 0, 0, 0.45), 0 0 20px rgba(0, 0, 0, 0.2)"
      : "0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1)",
    transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
    ...style,
  };

  return (
    <div
      className={`relative flex font-semibold overflow-hidden transition-all duration-700 ${
        dark ? "text-white" : "text-black"
      } ${className}`}
      style={glassStyle}
    >
      {/* Glass layers */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-3xl"
        style={{
          backdropFilter: dark ? "blur(6px) saturate(160%)" : "blur(3px)",
          WebkitBackdropFilter: dark ? "blur(6px) saturate(160%)" : "blur(3px)",
          filter: "url(#glass-distortion)",
          isolation: "isolate",
        }}
      />
      <div
        className="absolute inset-0 z-10 rounded-3xl"
        style={{
          background: dark ? "rgba(20, 20, 40, 0.5)" : "rgba(255, 255, 255, 0.25)",
        }}
      />
      <div
        className="absolute inset-0 z-20 rounded-3xl overflow-hidden"
        style={{
          boxShadow: dark
            ? "inset 2px 2px 1px 0 rgba(255, 255, 255, 0.22), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.12)"
            : "inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5)",
        }}
      />

      {/* Content */}
      <div className="relative z-30 flex w-full">{children}</div>
    </div>
  );
};

/** SVG displacement filter used by GlassEffect. Mount once per page. */
export const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }} aria-hidden>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale="5"
        specularConstant="1"
        specularExponent="100"
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x="-200" y="-200" z="300" />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1="0"
        k2="1"
        k3="1"
        k4="0"
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="200"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
