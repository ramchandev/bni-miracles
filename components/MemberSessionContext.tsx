"use client";

import { createContext, useContext, useState } from "react";
import type { SessionMember } from "@/lib/supabase";

type SessionCtx = {
  member: SessionMember | null;
  setMember: (m: SessionMember | null) => void;
};

const Ctx = createContext<SessionCtx>({ member: null, setMember: () => {} });

export function MemberSessionProvider({
  children,
  initialMember,
}: {
  children: React.ReactNode;
  initialMember: SessionMember | null;
}) {
  const [member, setMember] = useState<SessionMember | null>(initialMember);
  return <Ctx.Provider value={{ member, setMember }}>{children}</Ctx.Provider>;
}

export function useMemberSession() {
  return useContext(Ctx);
}
