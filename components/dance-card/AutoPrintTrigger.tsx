"use client";

import { useEffect } from "react";

/** Triggers window.print() 500ms after the page renders. */
export default function AutoPrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
