"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LoginModal from "@/components/LoginModal";
import { useMemberSession } from "@/components/MemberSessionContext";

/** Global login modal host — renders centered on screen (outside header backdrop). */
export default function MemberLoginHost() {
  const [open, setOpen] = useState(false);
  const { member } = useMemberSession();

  useEffect(() => {
    const handler = () => {
      if (!member) setOpen(true);
    };
    document.addEventListener("open-login", handler);
    return () => document.removeEventListener("open-login", handler);
  }, [member]);

  useEffect(() => {
    if (member) setOpen(false);
  }, [member]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(<LoginModal onClose={() => setOpen(false)} />, document.body);
}
